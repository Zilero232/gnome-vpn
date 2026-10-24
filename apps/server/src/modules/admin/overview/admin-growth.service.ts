import type { AdminAnalytics, AdminGrowth } from '@gnomevpn/schemas';

import { ADMIN_ANALYTICS } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { indexBy, isNonNullish } from 'remeda';

import { NOTICE_CLAIM, PrismaService } from '@/core';

import type { CheckoutReminderRow } from './overview.types';

import { amountOf, groupTotal } from '../shared/listing.helpers';
import { GROWTH } from './overview.config';

@Injectable()
export class AdminGrowthService {
  constructor(private readonly prisma: PrismaService) {}

  async referrals(start: Date): Promise<AdminAnalytics['referrals']> {
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

    const usersById = indexBy(users, (user) => user.id);

    return {
      invited: totals._count._all,
      rewarded,
      referrerDays: totals._sum.referrerDays ?? 0,
      friendDays: totals._sum.friendDays ?? 0,
      top: top.flatMap((row) => {
        const user = isNonNullish(row.referrerId) ? usersById[row.referrerId] : undefined;

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

  async growth(start: Date): Promise<AdminGrowth> {
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
      referredPayments: { count: referred._count._all, amount: amountOf(referred._sum.amount) },
      winBack: { offered, redeemed: winBack._count._all, revenue: amountOf(winBack._sum.amount) },
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
