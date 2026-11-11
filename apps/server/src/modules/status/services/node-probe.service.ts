import { Injectable } from '@nestjs/common';
import { subDays } from 'date-fns';

import { PrismaService } from '@/core';

import type { RecordProbeInput } from '../status.types';

import { NODE_PROBE } from '../config';

@Injectable()
export class NodeProbeService {
  constructor(private readonly prisma: PrismaService) {}

  async record({ nodeId, at, packetLoss, relayPacketLoss }: RecordProbeInput): Promise<void> {
    await this.prisma.nodeProbe.create({ data: { nodeId, at, packetLoss, relayPacketLoss } });
  }

  async prune(now: Date): Promise<void> {
    await this.prisma.nodeProbe.deleteMany({ where: { at: { lt: subDays(now, NODE_PROBE.retentionDays) } } });
  }
}
