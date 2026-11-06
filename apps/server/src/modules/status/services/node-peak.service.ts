import { Injectable } from '@nestjs/common';

import { addUtcDays, utcDay } from '@/common/lib';
import { PrismaService } from '@/core';

import type { RecordPeakInput } from '../status.types';

import { STATUS_PAGE } from '../config';

@Injectable()
export class NodePeakService {
  constructor(private readonly prisma: PrismaService) {}

  async record({ nodeId, at, online, cpu, memory }: RecordPeakInput): Promise<void> {
    const clients = online?.clients ?? null;
    const users = online?.users ?? null;

    await this.prisma.$executeRaw`
      INSERT INTO node_peak (node_id, day, clients, clients_at, users, cpu, memory)
      VALUES (${nodeId}, ${utcDay(at)}::date, ${clients}, ${clients === null ? null : at}, ${users}, ${cpu}, ${memory})
      ON CONFLICT (node_id, day) DO UPDATE SET
        clients_at = CASE
          WHEN EXCLUDED.clients > COALESCE(node_peak.clients, -1) THEN EXCLUDED.clients_at
          ELSE node_peak.clients_at
        END,
        clients = GREATEST(node_peak.clients, EXCLUDED.clients),
        users = GREATEST(node_peak.users, EXCLUDED.users),
        cpu = GREATEST(node_peak.cpu, EXCLUDED.cpu),
        memory = GREATEST(node_peak.memory, EXCLUDED.memory)
    `;
  }

  async prune(now: Date): Promise<void> {
    const cutoff = addUtcDays({ day: utcDay(now), days: -STATUS_PAGE.uptimeRetentionDays });

    await this.prisma.nodePeak.deleteMany({ where: { day: { lt: cutoff } } });
  }
}
