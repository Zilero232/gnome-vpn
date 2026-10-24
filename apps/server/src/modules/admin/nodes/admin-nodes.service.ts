import type { AdminNode, AdminNodeList } from '@gnomevpn/schemas';

import { adminNodeListSchema, adminNodeSchema } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';

import { utcDay } from '@/common/lib';
import { PrismaService } from '@/core';
import { historyStart, UPTIME_ROW_SELECT } from '@/modules/status';

import type { SetAvailabilityInput } from './nodes.types';

import { AdminAuditService } from '../shared/admin-audit.service';
import { ADMIN_ACTION, NODE_ORDER } from '../shared/admin.config';
import { ADMIN_NODE_SELECT } from './nodes.config';
import { nodeView } from './nodes.helpers';

@Injectable()
export class AdminNodesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService
  ) {}

  async list(): Promise<AdminNodeList> {
    const now = new Date();
    const nodes = await this.prisma.node.findMany({ orderBy: NODE_ORDER, select: this.select(now) });

    return adminNodeListSchema.parse({ nodes: nodes.map((node) => nodeView({ node, now })) });
  }

  async setAvailability({ admin, nodeId, isAvailable }: SetAvailabilityInput): Promise<AdminNode> {
    const now = new Date();
    const node = await this.prisma.node.update({ where: { id: nodeId }, data: { isAvailable }, select: this.select(now) });

    await this.audit.record({
      admin,
      action: ADMIN_ACTION.setNodeAvailability,
      summary: `${isAvailable ? 'put node back into rotation' : 'took node out of rotation'}: ${node.id}`,
      details: { nodeId: node.id, isAvailable }
    });

    return adminNodeSchema.parse(nodeView({ node, now }));
  }

  private select(now: Date) {
    return {
      ...ADMIN_NODE_SELECT,
      uptime: { where: { day: { gte: historyStart(utcDay(now)) } }, select: UPTIME_ROW_SELECT }
    };
  }
}
