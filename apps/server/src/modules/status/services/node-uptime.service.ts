import { Injectable } from '@nestjs/common';

import { addUtcDays, utcDay } from '@/common/lib';
import { PrismaService } from '@/core';

import type { RecordUptimeInput } from '../status.types';

import { STATUS_PAGE, UPTIME_NODE_SELECT } from '../config';
import { passedCheck } from '../lib/node-status';

@Injectable()
export class NodeUptimeService {
  constructor(private readonly prisma: PrismaService) {}

  async record({ checkedAt, nodeIds }: RecordUptimeInput): Promise<void> {
    const day = utcDay(checkedAt);

    const nodes = await this.prisma.node.findMany({ where: { id: { in: nodeIds } }, select: UPTIME_NODE_SELECT });

    await this.prisma.$transaction([
      ...nodes.map(({ id, lastHealthyAt }) => {
        const upMinutes = passedCheck({ lastHealthyAt, checkedAt }) ? 1 : 0;

        return this.prisma.nodeUptime.upsert({
          where: { nodeId_day: { nodeId: id, day } },
          create: { nodeId: id, day, checkedMinutes: 1, upMinutes },
          update: { checkedMinutes: { increment: 1 }, upMinutes: { increment: upMinutes } }
        });
      }),
      this.prisma.node.updateMany({ where: { id: { in: nodeIds } }, data: { lastCheckedAt: checkedAt } }),
      this.prisma.nodeUptime.deleteMany({ where: { day: { lt: addUtcDays({ day, days: -STATUS_PAGE.uptimeRetentionDays }) } } })
    ]);
  }
}
