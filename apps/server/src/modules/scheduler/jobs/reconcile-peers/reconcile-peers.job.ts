import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { isEmpty, isNullish, unique, zip } from 'remeda';

import { describeError } from '@/common/lib';
import { PrismaService } from '@/core';
import { IDENTIFIED_NODE_SELECT, xrayClientForNode } from '@/lib/xray';
import { LEGACY_PEER } from '@/modules/devices';
import { ALERT, SCHEDULE } from '@/modules/scheduler/config';
import { TelegramAlertService } from '@/modules/telegram/services/telegram-alert.service';
import { TelegramNotifyService } from '@/modules/telegram/services/telegram-notify.service';

import type { NoteFailureInput, ReconcileNodeInput } from './reconcile-peers.job.types';

import {
  changeSummary,
  collectOrphans,
  isFeedWireguardPeer,
  releaseFeedWireguard,
  releaseLegacy,
  releaseRevoked,
  restoreMissing,
  syncEnabled
} from './lib';
import { RECONCILE_PEER_SELECT } from './reconcile-peers.job.constants';

@Injectable()
export class ReconcilePeersJob {
  private readonly logger = new Logger(ReconcilePeersJob.name);
  private readonly bootedAt = Date.now();
  private readonly failures = new Map<string, number>();
  private running: Promise<void> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: TelegramNotifyService,
    private readonly alerts: TelegramAlertService
  ) {}

  private async reconcileNode({ node, withOrphans }: ReconcileNodeInput): Promise<string[]> {
    const xray = xrayClientForNode(node);

    const [peers, nodeClients, online] = await Promise.all([
      this.prisma.peer.findMany({ where: { nodeId: node.id }, select: RECONCILE_PEER_SELECT }),
      xray.clientEnabledByEmail(),
      withOrphans ? xray.onlineEmails() : Promise.resolve(null)
    ]);

    const released = await releaseRevoked({ prisma: this.prisma, xray, logger: this.logger, peers, nodeClients });
    const retired = await releaseLegacy({ prisma: this.prisma, xray, logger: this.logger, peers, nodeClients, online, now: new Date() });
    const feedWireguard = await releaseFeedWireguard({ prisma: this.prisma, xray, logger: this.logger, peers, nodeClients, online });
    const retiredIds = new Set([...retired, ...feedWireguard].map((peer) => peer.id));
    const live = peers.filter((peer) => isNullish(peer.revokedAt) && !retiredIds.has(peer.id));
    const restorable = live.filter((peer) => !isFeedWireguardPeer(peer));

    const restored = await restoreMissing({ prisma: this.prisma, logger: this.logger, xray, node, peers: restorable, nodeClients });
    const synced = await syncEnabled({ xray, peers: live, nodeClients });

    const collected = await collectOrphans({ prisma: this.prisma, xray, nodeId: node.id, peers, nodeClients, online });

    const changes = changeSummary({ released, retired: retired.length, feedWireguard: feedWireguard.length, restored, synced, collected });

    if (!isEmpty(changes)) {
      this.logger.log(`reconciled node ${node.id}: ${changes.join(', ')}`);
    }

    return unique(retired.map((peer) => peer.userId));
  }

  private async sweep(withOrphans: boolean): Promise<void> {
    if (Date.now() - this.bootedAt < SCHEDULE.bootGraceMs || (this.running && !withOrphans)) {
      return;
    }

    while (this.running) {
      await this.running.catch(() => undefined);
    }

    this.running = this.sweepNodes(withOrphans);

    try {
      await this.running;
    } finally {
      this.running = null;
    }
  }

  private async sweepNodes(withOrphans: boolean): Promise<void> {
    const nodes = await this.prisma.node.findMany({ select: IDENTIFIED_NODE_SELECT });

    const results = await Promise.allSettled(nodes.map((node) => this.reconcileNode({ node, withOrphans })));
    const retiredOwners: string[] = [];

    zip(nodes, results).forEach(([{ id: nodeId }, result]) => {
      if (result.status === 'fulfilled') {
        this.failures.delete(nodeId);
        retiredOwners.push(...result.value);

        return;
      }

      this.noteFailure({ nodeId, reason: result.reason });
    });

    await this.announceRetired(unique(retiredOwners));
  }

  private async announceRetired(owners: string[]): Promise<void> {
    if (isEmpty(owners)) {
      return;
    }

    const remaining = await this.prisma.peer.findMany({
      where: { userId: { in: owners }, kind: 'config', name: LEGACY_PEER.name, deviceId: null },
      distinct: ['userId'],
      select: { userId: true }
    });

    const holding = new Set(remaining.map((peer) => peer.userId));
    const done = owners.filter((userId) => !holding.has(userId));

    this.logger.log(`Retired the shared feed keys of ${owners.length} account(s)`);

    await Promise.all(done.map((userId) => this.notify.tell({ userId, notice: 'legacyRetired' })));
  }

  @Cron(SCHEDULE.reconcileCron)
  async run(): Promise<void> {
    await this.sweep(false);
  }

  @Cron(SCHEDULE.collectOrphansCron)
  async collect(): Promise<void> {
    await this.sweep(true);
  }

  private noteFailure({ nodeId, reason }: NoteFailureInput): void {
    const streak = (this.failures.get(nodeId) ?? 0) + 1;

    this.failures.set(nodeId, streak);

    const message = `Reconcile failed for node ${nodeId} (${streak} in a row): ${describeError(reason)}`;

    if (streak >= ALERT.reconcileFailureStreak) {
      this.logger.error(`${message}. Revoked peers on this node stay connected until it converges.`);
      this.alerts.reconcileFailing({ nodeId, streak, error: describeError(reason) });

      return;
    }

    this.logger.warn(message);
  }
}
