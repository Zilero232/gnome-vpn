import type { AdminOverview } from '@gnomevpn/schemas';

import { ADMIN_OVERVIEW, adminOverviewSchema } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';

import { windowStart } from '@/common/lib';
import { PrismaService } from '@/core';

import { foldShares, nodeTally } from '../lib';
import { AdminSeriesService } from './admin-series.service';
import { AdminStatsService } from './admin-stats.service';

@Injectable()
export class AdminOverviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stats: AdminStatsService,
    private readonly series: AdminSeriesService
  ) {}

  async overview(now: Date): Promise<AdminOverview> {
    const [snapshot, trend, platforms, apps] = await Promise.all([
      this.stats.collect(now),
      this.series.days({ start: windowStart({ now, days: ADMIN_OVERVIEW.trendDays }), days: ADMIN_OVERVIEW.trendDays }),
      this.prisma.device.groupBy({ by: ['platform'], _count: { _all: true } }),
      this.prisma.device.groupBy({ by: ['app'], _count: { _all: true } })
    ]);

    return adminOverviewSchema.parse({
      users: snapshot.users,
      subscriptions: snapshot.subscriptions,
      payments: snapshot.payments,
      devices: snapshot.devices,
      chats: snapshot.chats,
      nodes: nodeTally({ nodes: snapshot.nodes, now }),
      trend: {
        dates: trend.map((day) => day.date),
        revenue: trend.map((day) => day.revenue),
        signups: trend.map((day) => day.signups)
      },
      devicesBy: {
        platform: foldShares({ rows: platforms.map((row) => ({ label: row.platform, count: row._count._all })), limit: ADMIN_OVERVIEW.shareLimit }),
        app: foldShares({ rows: apps.map((row) => ({ label: row.app, count: row._count._all })), limit: ADMIN_OVERVIEW.shareLimit })
      }
    });
  }
}
