import { REFERRAL_POLICY, referralReward } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { subDays } from 'date-fns';
import { clamp, isNonNullish, isNullish } from 'remeda';

import { SubscriptionPeriodService } from '@/modules/subscription';

import type { ReferrerShareInput, RevokeInput, RevokeOutcome, RewardInput, RewardOutcome } from '../referrals.types';

@Injectable()
export class ReferralRewardService {
  constructor(private readonly periods: SubscriptionPeriodService) {}

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

    await this.periods.extend({ userId, days: planned.friendDays, db });

    const isBanked = isNonNullish(referrerId) && referrerDays > 0 && (await this.periods.creditDays({ userId: referrerId, days: referrerDays, db }));

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
      await this.periods.rewind({ userId: referral.referredId, days: referral.friendDays, db });
    }

    if (isNonNullish(referral.referrerId)) {
      await this.periods.debitDays({ userId: referral.referrerId, days: referral.referrerDays, db });
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

    return clamp(REFERRAL_POLICY.capDays - (earned._sum.referrerDays ?? 0), { min: 0, max: planned });
  }
}
