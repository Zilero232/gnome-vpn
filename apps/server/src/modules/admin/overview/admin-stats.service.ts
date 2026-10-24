import { Injectable } from '@nestjs/common';
import { subDays, subHours } from 'date-fns';

import { PrismaService } from '@/core';
import { periodKind } from '@/modules/subscription';

import type { StatsSnapshot } from './overview.types';

import { NODE_ORDER, ROW_SELECT } from '../shared/admin.config';
import { amountOf } from '../shared/listing.helpers';
import { isAutoRenewOn } from '../shared/rows.helpers';
import { STATS_WINDOW } from './overview.config';
import { subscriptionTally } from './overview.helpers';

@Injectable()
export class AdminStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async collect(now: Date): Promise<StatsSnapshot> {
    const [total, day, week, subscriptions, payments, devices, chats, nodes] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: subHours(now, STATS_WINDOW.newUsersHours) } } }),
      this.prisma.user.count({ where: { createdAt: { gte: subDays(now, STATS_WINDOW.newUsersDays) } } }),
      this.prisma.subscription.findMany({
        where: { currentPeriodEnd: { gt: now } },
        select: { plan: true, currentPeriodEnd: true, trialStartedAt: true, cancelAtPeriodEnd: true, savedCardId: true }
      }),
      this.prisma.payment.aggregate({
        where: { status: 'succeeded', createdAt: { gte: subDays(now, STATS_WINDOW.paymentsDays) } },
        _count: { _all: true },
        _sum: { amount: true }
      }),
      this.prisma.device.count(),
      this.prisma.telegramAccount.count(),
      this.prisma.node.findMany({ select: ROW_SELECT.node, orderBy: NODE_ORDER })
    ]);

    return {
      users: { total, day, week },
      subscriptions: subscriptionTally(subscriptions.map((row) => ({ plan: row.plan, period: periodKind(row), isAutoRenew: isAutoRenewOn(row) }))),
      payments: { days: STATS_WINDOW.paymentsDays, count: payments._count._all, amount: amountOf(payments._sum.amount) },
      devices,
      chats,
      nodes
    };
  }
}
