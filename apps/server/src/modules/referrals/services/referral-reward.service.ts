import { REFERRAL_POLICY, referralReward } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { subDays } from 'date-fns';
import { isNonNullish, isNullish } from 'remeda';

import type { ExtendInput, ReferrerShareInput, RevokeInput, RevokeOutcome, RewardInput, RewardOutcome } from '../referrals.types';

import { extendPeriod, rewindPeriod } from '../../../common/lib';
import { periodKind } from '../../subscription';
import { grantedDays } from '../lib';

@Injectable()
export class ReferralRewardService {
  async reward({ userId, planId, paymentId, db }: RewardInput): Promise<RewardOutcome | null> {
    const referral = await db.referral.findUnique({
      where: { referredId: userId },
      select: { id: true, referrerId: true, rewardedAt: true }
    });

    if (isNullish(referral) || isNonNullish(referral.rewardedAt)) {
      return null;
    }

    const paidBefore = await db.payment.count({
      where: { userId, kind: 'subscription', status: 'succeeded', id: { not: paymentId } }
    });

    if (paidBefore > 0) {
      return null;
    }

    const now = new Date();
    const planned = referralReward(planId);
    const { referrerId } = referral;
    const referrerDays = isNullish(referrerId) ? 0 : await this.referrerShare({ referrerId, planned: planned.referrerDays, now, db });

    const claimed = await db.referral.updateMany({
      where: { id: referral.id, rewardedAt: null },
      data: { rewardedAt: now, paymentId, referrerDays, friendDays: planned.friendDays }
    });

    if (claimed.count === 0) {
      return null;
    }

    await this.extend({ userId, days: planned.friendDays, db });

    const isBanked = isNonNullish(referrerId) && referrerDays > 0 && (await this.creditReferrer({ userId: referrerId, days: referrerDays, db }));

    return { referrerId, referrerDays, friendDays: planned.friendDays, isBanked };
  }

  async revoke({ paymentId, db }: RevokeInput): Promise<RevokeOutcome | null> {
    const referral = await db.referral.findUnique({
      where: { paymentId },
      select: { id: true, referrerId: true, referredId: true, referrerDays: true, friendDays: true }
    });

    if (isNullish(referral) || (referral.referrerDays === 0 && referral.friendDays === 0)) {
      return null;
    }

    if (isNonNullish(referral.referredId)) {
      await this.shorten({ userId: referral.referredId, days: referral.friendDays, db });
    }

    if (isNonNullish(referral.referrerId)) {
      await this.debitReferrer({ userId: referral.referrerId, days: referral.referrerDays, db });
    }

    await db.referral.update({
      where: { id: referral.id },
      data: { referrerDays: 0, friendDays: 0 }
    });

    return {
      referrerId: referral.referrerId,
      referredId: referral.referredId,
      referrerDays: referral.referrerDays,
      friendDays: referral.friendDays
    };
  }

  private async referrerShare({ referrerId, planned, now, db }: ReferrerShareInput): Promise<number> {
    const earned = await db.referral.aggregate({
      where: { referrerId, rewardedAt: { gte: subDays(now, REFERRAL_POLICY.capWindowDays) } },
      _sum: { referrerDays: true }
    });

    return grantedDays({ planned, earned: earned._sum.referrerDays ?? 0, cap: REFERRAL_POLICY.capDays });
  }

  private async debitReferrer({ userId, days, db }: ExtendInput): Promise<void> {
    const subscription = await db.subscription.findUnique({ where: { userId }, select: { bonusDays: true } });

    if (isNullish(subscription)) {
      return;
    }

    const fromBank = Math.min(subscription.bonusDays, days);

    if (fromBank > 0) {
      await db.subscription.update({ where: { userId }, data: { bonusDays: { decrement: fromBank } } });
    }

    await this.shorten({ userId, days: days - fromBank, db });
  }

  private async shorten({ userId, days, db }: ExtendInput): Promise<void> {
    if (days <= 0) {
      return;
    }

    const subscription = await db.subscription.findUnique({ where: { userId }, select: { currentPeriodEnd: true } });

    if (isNullish(subscription)) {
      return;
    }

    await db.subscription.update({
      where: { userId },
      data: { currentPeriodEnd: rewindPeriod({ currentPeriodEnd: subscription.currentPeriodEnd, days }) }
    });
  }

  private async creditReferrer({ userId, days, db }: ExtendInput): Promise<boolean> {
    const subscription = await db.subscription.findUnique({
      where: { userId },
      select: { currentPeriodEnd: true, trialStartedAt: true }
    });

    if (periodKind(subscription) === 'paid') {
      await this.extend({ userId, days, db });

      return false;
    }

    await db.subscription.upsert({
      where: { userId },
      create: { userId, bonusDays: days },
      update: { bonusDays: { increment: days } }
    });

    return true;
  }

  private async extend({ userId, days, db }: ExtendInput): Promise<void> {
    const { currentPeriodEnd } = await db.subscription.findUniqueOrThrow({
      where: { userId },
      select: { currentPeriodEnd: true }
    });

    await db.subscription.update({
      where: { userId },
      data: { currentPeriodEnd: extendPeriod({ currentPeriodEnd, days }) }
    });
  }
}
