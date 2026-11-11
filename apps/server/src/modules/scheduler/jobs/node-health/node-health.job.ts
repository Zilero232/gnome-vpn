import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isNonNullish, isNullish } from 'remeda';

import { describeError } from '@/common/lib';
import { PrismaService } from '@/core';
import { xrayClientForNode } from '@/lib/xray';
import { NodeTrafficService } from '@/modules/peers';
import { ALERT } from '@/modules/scheduler/config';
import { isRelayPassing, NODE_LOSS, NodePeakService, NodeProbeService, NodeUptimeService } from '@/modules/status';
import { TelegramAlertService } from '@/modules/telegram/notify';

import type {
  LoadReading,
  NoteLoadInput,
  NoteReadingInput,
  NoteRestartInput,
  ProbedNode,
  ProbeNodeRow,
  RecordActivityInput,
  RecordNodeInput
} from './node-health.job.types';

import { deviceActivity, isOverloaded, isSustainedLoad, nextLoadStreak, nodeRestart, onlineCount, reachLoss } from './lib';
import { ACTIVITY_PEER_SELECT, PROBE_NODE_SELECT } from './node-health.job.constants';

@Injectable()
export class NodeHealthJob {
  private readonly logger = new Logger(NodeHealthJob.name);
  private readonly loadStreaks = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeTraffic: NodeTrafficService,
    private readonly uptime: NodeUptimeService,
    private readonly peaks: NodePeakService,
    private readonly probes: NodeProbeService,
    private readonly alerts: TelegramAlertService
  ) {}

  private async probe(node: ProbeNodeRow): Promise<void> {
    const at = new Date();
    const [probed, packetLoss, relayPacketLoss] = await Promise.all([this.check(node), this.measureLoss(node), this.measureRelayLoss(node)]);
    const isUp = isNonNullish(probed);
    const reach = { packetLoss, ...(isRelayPassing(relayPacketLoss) && { relayHealthyAt: at }) };

    this.alerts.nodeProbed({ nodeId: node.id, isUp, healthyAt: isUp ? new Date() : (node.lastHealthyAt ?? node.createdAt) });
    this.noteReading({ node, reading: { resource: 'loss', percent: packetLoss, threshold: NODE_LOSS.degradedPercent } });
    this.noteReading({ node, reading: { resource: 'relay', percent: relayPacketLoss, threshold: NODE_LOSS.relayDownPercent } });

    await this.probes.record({ nodeId: node.id, at, packetLoss, relayPacketLoss }).catch((error: unknown) => {
      this.logger.warn(`Node probe not recorded: ${node.id}: ${describeError(error)}`);
    });

    if (!isUp) {
      await this.prisma.node.update({ where: { id: node.id }, data: reach });

      return;
    }

    const { xray, health } = probed;

    this.noteRestart({ node, health });

    await this.prisma.node.update({
      where: { id: node.id },
      data: {
        lastHealthyAt: new Date(),
        isOverloaded: isOverloaded(health),
        ...reach,
        bootedAt: health.bootedAt ?? node.bootedAt,
        coreStartedAt: health.coreStartedAt ?? node.coreStartedAt
      }
    });

    await Promise.all([this.recordActivity({ node, xray, health }), this.recordTraffic({ node, xray })]);
  }

  private async measureLoss(node: ProbeNodeRow): Promise<number | null> {
    return reachLoss({ host: node.host, port: node.port }).catch((error: unknown) => {
      this.logger.warn(`Node reach probe failed: ${node.id}: ${describeError(error)}`);

      return null;
    });
  }

  private async measureRelayLoss(node: ProbeNodeRow): Promise<number | null> {
    if (isNullish(node.relayHost) || isNullish(node.relayPort)) {
      return null;
    }

    return reachLoss({ host: node.relayHost, port: node.relayPort }).catch((error: unknown) => {
      this.logger.warn(`Relay reach probe failed: ${node.id}: ${describeError(error)}`);

      return null;
    });
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

  private async recordActivity({ node, xray, health }: RecordActivityInput): Promise<void> {
    const [peers, lastOnline, onlineEmails] = await Promise.all([
      this.prisma.peer.findMany({ where: { nodeId: node.id, revokedAt: null }, select: ACTIVITY_PEER_SELECT }),
      xray.lastOnline(),
      xray.onlineEmails()
    ]);

    const activity = deviceActivity({ peers, lastOnline });
    const online = isNullish(onlineEmails) ? null : onlineCount({ peers, online: onlineEmails });
    const memory = isNonNullish(health.memoryRatio) ? health.memoryRatio * 100 : null;

    await this.prisma.$transaction([
      ...[...activity].map(([deviceId, at]) =>
        this.prisma.device.updateMany({ where: { id: deviceId, lastSeenAt: { lt: at } }, data: { lastSeenAt: at } })
      ),
      this.prisma.node.update({
        where: { id: node.id },
        data: { onlineClients: online?.clients ?? null, onlineUsers: online?.users ?? null }
      })
    ]);

    await this.peaks.record({ nodeId: node.id, at: new Date(), online, cpu: health.cpu, memory });
  }

  private noteRestart({ node, health }: NoteRestartInput): void {
    const restart = nodeRestart({ previous: node, current: health });

    if (isNullish(restart)) {
      return;
    }

    const isReboot = restart === 'reboot';
    const restartedAt = (isReboot ? health.bootedAt : health.coreStartedAt) ?? new Date();
    const what = isReboot ? 'the host rebooted' : 'the xray core restarted';

    this.logger.warn(`node ${node.id}: ${what} at ${restartedAt.toISOString()}`);
    this.alerts.nodeRestarted({ nodeId: node.id, restart, restartedAt });
  }

  private noteLoad({ node, health }: NoteLoadInput): void {
    const memoryPercent = isNonNullish(health.memoryRatio) ? health.memoryRatio * 100 : null;

    const readings: LoadReading[] = [
      { resource: 'cpu', percent: health.cpu, threshold: ALERT.nodeCpuPercent },
      { resource: 'memory', percent: memoryPercent, threshold: ALERT.nodeMemoryRatio * 100 }
    ];

    for (const reading of readings) {
      this.noteReading({ node, reading });
    }
  }

  private noteReading({ node, reading }: NoteReadingInput): void {
    const { resource, percent, threshold } = reading;
    const key = `${resource}:${node.id}`;
    const isHot = isNonNullish(percent) && percent >= threshold;
    const streak = nextLoadStreak({ previous: this.loadStreaks.get(key) ?? 0, isHot });

    this.loadStreaks.set(key, streak);

    if (isNullish(percent) || !isSustainedLoad(streak)) {
      return;
    }

    this.logger.warn(`node ${node.id} has been at ${percent.toFixed(0)}% ${resource} for ${streak} minutes`);
    this.alerts.nodeLoad({ nodeId: node.id, resource, percent });
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

    await this.peaks.prune(checkedAt).catch((error: unknown) => {
      this.logger.warn(`Old node peaks not pruned: ${describeError(error)}`);
    });

    await this.probes.prune(checkedAt).catch((error: unknown) => {
      this.logger.warn(`Old node probes not pruned: ${describeError(error)}`);
    });
  }
}
