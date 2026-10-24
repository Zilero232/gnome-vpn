import type { ServerStatus } from '@gnomevpn/schemas';

import { serverStatusSchema } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';

import { utcDay } from '@/common/lib';
import { PrismaService } from '@/core';

import { STATUS_NODE_ORDER, STATUS_NODE_SELECT, UPTIME_ROW_SELECT } from '../config';
import { historyStart, nodeStatus } from '../lib/node-status';

@Injectable()
export class ServerStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async status(): Promise<ServerStatus> {
    const now = new Date();

    const nodes = await this.prisma.node.findMany({
      where: { isAvailable: true },
      orderBy: [...STATUS_NODE_ORDER],
      select: {
        ...STATUS_NODE_SELECT,
        uptime: { where: { day: { gte: historyStart(utcDay(now)) } }, select: UPTIME_ROW_SELECT }
      }
    });

    return serverStatusSchema.parse({ nodes: nodes.map((node) => nodeStatus({ node, now })) });
  }
}
