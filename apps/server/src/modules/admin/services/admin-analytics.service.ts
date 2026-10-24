import type { AdminAnalytics, AdminGrowth } from '@gnomevpn/schemas';

import { ADMIN_ANALYTICS, ADMIN_PERIOD_DAYS, adminAnalyticsSchema, paymentKindSchema, PLANS } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { isNonNullish } from 'remeda';

import { windowStart } from '@/common/lib';
import { NOTICE_CLAIM, PrismaService } from '@/core';

import type { AnalyticsInput, CheckoutReminderRow, ConversionRow } from '../admin.types';

import { GROWTH } from '../config';
import { groupTotal } from '../lib';
import { AdminSeriesService } from './admin-series.service';

@Injectable()
export class AdminAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly series: AdminSeriesService
  ) {}

  async analytics({ range, now }: AnalyticsInput): Promise<AdminAnalytics> {
    const days = ADMIN_PERIOD_DAYS[range];
    const start = windowStart({ now, days });

    const [series, conversion, revenueByPlan, revenueByKind, referrals, growth] = await Promise.all([
      this.series.days({ start, days }),
      this.conversion(start),
      this.revenueByPlan(start),
      this.revenueByKind(start),
      this.referrals(start),
      this.growth(start)
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

  private async referrals(start: Date): Promise<AdminAnalytics['referrals']> {
    const where = { createdAt: { gte: start } };

    const [totals, rewarded, top] = await Promise.all([
      this.prisma.referral.aggregate({ where, _count: { _all: true }, _sum: { referrerDays: true, friendDays: true } }),
      this.prisma.referral.count({ where: { ...where, rewardedAt: { not: null } } }),
      this.prisma.referral.groupBy({
        by: ['referrerId'],
        where: { ...where, referrerId: { not: null } },
        _count: { _all: true },
        _sum: { referrerDays: true },
        orderBy: [{ _count: { referrerId: 'desc' } }, { referrerId: 'asc' }],
        take: ADMIN_ANALYTICS.topReferrers
      })
    ]);

    const referrerIds = top.map((row) => row.referrerId).filter(isNonNullish);

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
                rewarded: groupTotal({ groups: rewardedBy, by: 'referrerId', value: row.referrerId }).count,
                days: row._sum.referrerDays ?? 0
              }
            ]
          : [];
      })
    };
  }

  private async growth(start: Date): Promise<AdminGrowth> {
    const succeeded = { status: 'succeeded' as const, createdAt: { gte: start } };

    const [referred, offered, winBack, reminders] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { ...succeeded, kind: 'subscription', user: { is: { referredBy: { isNot: null } } } },
        _count: { _all: true },
        _sum: { amount: true }
      }),
      this.prisma.promoRedemption.count({ where: { createdAt: { gte: start }, promoCode: { isAutomatic: true } } }),
      this.prisma.payment.aggregate({
        where: { ...succeeded, promoCode: { is: { isAutomatic: true } } },
        _count: { _all: true },
        _sum: { amount: true }
      }),
      this.checkoutReminders(start)
    ]);

    return {
      referredPayments: { count: referred._count._all, amount: referred._sum.amount?.toNumber() ?? 0 },
      winBack: { offered, redeemed: winBack._count._all, revenue: winBack._sum.amount?.toNumber() ?? 0 },
      checkoutReminders: reminders
    };
  }

  private async checkoutReminders(start: Date): Promise<CheckoutReminderRow> {
    const [row] = await this.prisma.$queryRaw<CheckoutReminderRow[]>`
      SELECT count(*)::int AS sent,
             count(*) FILTER (
               WHERE EXISTS (
                 SELECT 1
                 FROM payment AS paid
                 WHERE paid.user_id = reminded.user_id
                   AND paid.kind = 'subscription'
                   AND paid.status = 'succeeded'
                   AND paid.created_at > reminded.sent_at
                   AND paid.created_at <= reminded.sent_at + make_interval(days => ${GROWTH.checkoutRecoveryDays}::int)
               )
             )::int AS recovered
      FROM notice_log AS reminded
      WHERE reminded.notice = ${NOTICE_CLAIM.checkoutReminder}
        AND reminded.sent_at >= ${start}`;

    return row ?? { sent: 0, recovered: 0 };
  }
}
