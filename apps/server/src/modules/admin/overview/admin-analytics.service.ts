import type { AdminAnalytics, AdminAnalyticsRange } from '@gnomevpn/schemas';

import { ADMIN_PERIOD_DAYS, adminAnalyticsSchema, paymentKindSchema, PLANS } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';

import { windowStart } from '@/common/lib';
import { PrismaService } from '@/core';

import type { ConversionRow } from './overview.types';

import { groupTotal } from '../shared/listing.helpers';
import { AdminGrowthService } from './admin-growth.service';
import { AdminSeriesService } from './admin-series.service';

@Injectable()
export class AdminAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly series: AdminSeriesService,
    private readonly growth: AdminGrowthService
  ) {}

  async analytics(range: AdminAnalyticsRange): Promise<AdminAnalytics> {
    const days = ADMIN_PERIOD_DAYS[range];
    const start = windowStart({ now: new Date(), days });

    const [series, conversion, revenueByPlan, revenueByKind, referrals, growth] = await Promise.all([
      this.series.days({ start, days }),
      this.conversion(start),
      this.revenueByPlan(start),
      this.revenueByKind(start),
      this.growth.referrals(start),
      this.growth.growth(start)
    ]);

    return adminAnalyticsSchema.parse({ range, days: series, conversion, revenueByPlan, revenueByKind, referrals, growth });
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

    return PLANS.map(({ id }) => ({ plan: id, ...groupTotal({ groups: rows, by: 'plan', value: id }) }));
  }

  private async revenueByKind(start: Date): Promise<AdminAnalytics['revenueByKind']> {
    const rows = await this.prisma.payment.groupBy({
      by: ['kind'],
      where: { status: 'succeeded', createdAt: { gte: start } },
      _count: { _all: true },
      _sum: { amount: true }
    });

    return paymentKindSchema.options.map((kind) => ({ kind, ...groupTotal({ groups: rows, by: 'kind', value: kind }) }));
  }
}
