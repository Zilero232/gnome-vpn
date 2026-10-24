import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isNonNullish, isNullish } from 'remeda';

import { describeError } from '@/common/lib';
import { PrismaService } from '@/core';
import { xrayClientForNode } from '@/lib/xray';
import { ALERT } from '@/modules/scheduler/config';
import { NodeUptimeService } from '@/modules/status';
import { NodeTrafficService } from '@/modules/subscription-link';
import { TelegramAlertService } from '@/modules/telegram/services/telegram-alert.service';

import type { NoteLoadInput, ProbedNode, ProbeNodeRow, RecordNodeInput } from './node-health.job.types';

import { deviceActivity, isOverloaded } from './lib';
import { ACTIVITY_PEER_SELECT, PROBE_NODE_SELECT } from './node-health.job.constants';

@Injectable()
export class NodeHealthJob {
  private readonly logger = new Logger(NodeHealthJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeTraffic: NodeTrafficService,
    private readonly uptime: NodeUptimeService,
    private readonly alerts: TelegramAlertService
  ) {}

  private async probe(node: ProbeNodeRow): Promise<void> {
    const probed = await this.check(node);
    const isUp = isNonNullish(probed);

    this.alerts.nodeProbed({ nodeId: node.id, isUp, healthyAt: isUp ? new Date() : (node.lastHealthyAt ?? node.createdAt) });

    if (!isUp) {
      return;
    }

    const { xray, health } = probed;

    await this.prisma.node.update({
      where: { id: node.id },
      data: { lastHealthyAt: new Date(), isOverloaded: isOverloaded(health) }
    });

    await Promise.all([this.recordActivity({ node, xray }), this.recordTraffic({ node, xray })]);
  }

  private async connect(node: ProbeNodeRow): Promise<ProbedNode> {
    const xray = xrayClientForNode(node);

    return { xray, health: await xray.health() };
  }

  private async check(node: ProbeNodeRow): Promise<ProbedNode | null> {
    const probed = await this.connect(node).catch((error: unknown) => {
      this.logger.warn(`Node probe failed: ${node.id}: ${describeError(error)}`);

      return null;
    });

    if (isNullish(probed)) {
      return null;
    }

    const { health } = probed;

    this.noteLoad({ node, health });

    if (!health.isHealthy) {
      this.logger.warn(`node ${node.id} answered but its inbound is disabled`);

      return null;
    }

    return probed;
  }

  private async recordTraffic({ node, xray }: RecordNodeInput): Promise<void> {
    this.nodeTraffic.record({ nodeId: node.id, traffic: await xray.clientTraffic() });
  }

  private async recordActivity({ node, xray }: RecordNodeInput): Promise<void> {
    const [peers, lastOnline] = await Promise.all([
      this.prisma.peer.findMany({ where: { nodeId: node.id, revokedAt: null, deviceId: { not: null } }, select: ACTIVITY_PEER_SELECT }),
      xray.lastOnline()
    ]);

    const activity = deviceActivity({ peers, lastOnline });

    await this.prisma.$transaction(
      [...activity].map(([deviceId, at]) =>
        this.prisma.device.updateMany({ where: { id: deviceId, lastSeenAt: { lt: at } }, data: { lastSeenAt: at } })
      )
    );
  }

  private noteLoad({ node, health }: NoteLoadInput): void {
    if (isNonNullish(health.cpu) && health.cpu >= ALERT.nodeCpuPercent) {
      this.logger.warn(`node ${node.id} is at ${health.cpu.toFixed(0)}% cpu`);
      this.alerts.nodeLoad({ nodeId: node.id, resource: 'cpu', percent: health.cpu });
    }

    if (isNonNullish(health.memoryRatio) && health.memoryRatio >= ALERT.nodeMemoryRatio) {
      this.logger.warn(`node ${node.id} is at ${(health.memoryRatio * 100).toFixed(0)}% memory`);
      this.alerts.nodeLoad({ nodeId: node.id, resource: 'memory', percent: health.memoryRatio * 100 });
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, { waitForCompletion: true })
  async run(): Promise<void> {
    const checkedAt = new Date();

    const nodes = await this.prisma.node.findMany({
      where: { isAvailable: true },
      select: PROBE_NODE_SELECT
    });

    this.nodeTraffic.keepOnly(new Set(nodes.map((node) => node.id)));

    const results = await Promise.allSettled(nodes.map((node) => this.probe(node)));

    for (const result of results) {
      if (result.status === 'rejected') {
        this.logger.warn(`Node probe failed: ${describeError(result.reason)}`);
      }
    }

    await this.uptime.record({ checkedAt, nodeIds: nodes.map((node) => node.id) }).catch((error: unknown) => {
      this.logger.warn(`Node uptime not recorded: ${describeError(error)}`);
    });
  }
}
