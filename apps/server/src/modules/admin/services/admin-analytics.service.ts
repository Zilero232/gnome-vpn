import type { AdminAnalytics } from '@gnomevpn/schemas';

import { ADMIN_ANALYTICS, ADMIN_PERIOD_DAYS, adminAnalyticsSchema, paymentKindSchema, PLANS } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';

import type { AnalyticsInput, ConversionRow } from '../admin.types';

import { PrismaService } from '../../../core';
import { bucketStart } from '../lib';
import { AdminSeriesService } from './admin-series.service';

@Injectable()
export class AdminAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly series: AdminSeriesService
  ) {}

  async analytics({ range, now }: AnalyticsInput): Promise<AdminAnalytics> {
    const days = ADMIN_PERIOD_DAYS[range];
    const start = bucketStart({ now, days });

    const [series, conversion, revenueByPlan, revenueByKind, referrals] = await Promise.all([
      this.series.days({ start, days }),
      this.conversion(start),
      this.revenueByPlan(start),
      this.revenueByKind(start),
      this.referrals(start)
    ]);

    return adminAnalyticsSchema.parse({ range, days: series, conversion, revenueByPlan, revenueByKind, referrals });
  }

  private async conversion(start: Date): Promise<ConversionRow> {
    const [row] = await this.prisma.$queryRaw<ConversionRow[]>`
      SELECT count(*)::int AS trials,
             count(*) FILTER (
               WHERE EXISTS (
                 SELECT 1
                 FROM payment AS paid
                 WHERE paid.user_id = trial.user_id
                   AND paid.kind = 'subscription'
                   AND paid.status = 'succeeded'
                   AND paid.created_at >= trial.trial_started_at
               )
             )::int AS converted
      FROM subscription AS trial
      WHERE trial.trial_started_at >= ${start}`;

    return row ?? { trials: 0, converted: 0 };
  }

  private async revenueByPlan(start: Date): Promise<AdminAnalytics['revenueByPlan']> {
    const rows = await this.prisma.payment.groupBy({
      by: ['plan'],
      where: { status: 'succeeded', kind: 'subscription', createdAt: { gte: start } },
      _count: { _all: true },
      _sum: { amount: true }
    });

    return PLANS.map(({ id }) => {
      const row = rows.find((each) => each.plan === id);

      return { plan: id, amount: row?._sum.amount?.toNumber() ?? 0, count: row?._count._all ?? 0 };
    });
  }

  private async revenueByKind(start: Date): Promise<AdminAnalytics['revenueByKind']> {
    const rows = await this.prisma.payment.groupBy({
      by: ['kind'],
      where: { status: 'succeeded', createdAt: { gte: start } },
      _count: { _all: true },
      _sum: { amount: true }
    });

    return paymentKindSchema.options.map((kind) => {
      const row = rows.find((each) => each.kind === kind);

      return { kind, amount: row?._sum.amount?.toNumber() ?? 0, count: row?._count._all ?? 0 };
    });
  }

  private async referrals(start: Date): Promise<AdminAnalytics['referrals']> {
    const where = { createdAt: { gte: start } };

    const [totals, rewarded, top] = await Promise.all([
      this.prisma.referral.aggregate({ where, _count: { _all: true }, _sum: { referrerDays: true, friendDays: true } }),
      this.prisma.referral.count({ where: { ...where, rewardedAt: { not: null } } }),
      this.prisma.referral.groupBy({
        by: ['referrerId'],
        where,
        _count: { _all: true },
        _sum: { referrerDays: true },
        orderBy: [{ _count: { referrerId: 'desc' } }, { referrerId: 'asc' }],
        take: ADMIN_ANALYTICS.topReferrers
      })
    ]);

    const referrerIds = top.map((row) => row.referrerId);

    const [users, rewardedBy] = await Promise.all([
      this.prisma.user.findMany({ where: { id: { in: referrerIds } }, select: { id: true, email: true } }),
      this.prisma.referral.groupBy({
        by: ['referrerId'],
        where: { ...where, referrerId: { in: referrerIds }, rewardedAt: { not: null } },
        _count: { _all: true }
      })
    ]);

    return {
      invited: totals._count._all,
      rewarded,
      referrerDays: totals._sum.referrerDays ?? 0,
      friendDays: totals._sum.friendDays ?? 0,
      top: top.flatMap((row) => {
        const user = users.find((each) => each.id === row.referrerId);

        return user
          ? [
              {
                user,
                invited: row._count._all,
                rewarded: rewardedBy.find((each) => each.referrerId === row.referrerId)?._count._all ?? 0,
                days: row._sum.referrerDays ?? 0
              }
            ]
          : [];
      })
    };
  }
}
