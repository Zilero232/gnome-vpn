import type { AdminNode, AdminNodeList } from '@gnomevpn/schemas';

import { adminNodeListSchema, adminNodeSchema } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';

import type { SetAvailabilityInput } from '../admin.types';

import { PrismaService } from '../../../core';
import { historyStart, UPTIME_ROW_SELECT, utcDay } from '../../status';
import { ADMIN_NODE_SELECT, NODE_ORDER } from '../config';
import { nodeView } from '../lib';

@Injectable()
export class AdminNodesService {
  private readonly logger = new Logger(AdminNodesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(now: Date): Promise<AdminNodeList> {
    const nodes = await this.prisma.node.findMany({ orderBy: [...NODE_ORDER], select: this.select(now) });

    return adminNodeListSchema.parse({ nodes: nodes.map((node) => nodeView({ node, now })) });
  }

  async setAvailability({ admin, nodeId, isAvailable, now }: SetAvailabilityInput): Promise<AdminNode> {
    const node = await this.prisma.node.update({ where: { id: nodeId }, data: { isAvailable }, select: this.select(now) });

    this.logger.log(`admin ${admin.email} ${isAvailable ? 'put node back into rotation' : 'took node out of rotation'}: ${node.id}`);

    return adminNodeSchema.parse(nodeView({ node, now }));
  }

  private select(now: Date) {
    return {
      ...ADMIN_NODE_SELECT,
      uptime: { where: { day: { gte: historyStart(utcDay(now)) } }, select: UPTIME_ROW_SELECT }
    };
  }
}
