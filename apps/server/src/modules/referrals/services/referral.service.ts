import type { ReferralOverview } from '@gnomevpn/schemas';

import { REFERRAL_POLICY } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { isAfter, subDays } from 'date-fns';
import { isNonNullish, isNullish } from 'remeda';

import type { AdoptInput, AttributeInput, AttributeResult, EligibilityInput } from '../referrals.types';

import { AppBadRequestException, AppNotFoundException, AppServiceUnavailableException } from '../../../common/exceptions';
import { AppConfigService } from '../../../config';
import { isPrismaRequestError, PrismaService, UNIQUE_VIOLATION } from '../../../core';
import { REFERRAL_CODE_ATTEMPTS } from '../config';
import { generateReferralCode, telegramReferralLink, webReferralLink } from '../lib';

@Injectable()
export class ReferralService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService
  ) {}

  async overview(userId: string): Promise<ReferralOverview> {
    const code = await this.ensureCode(userId);

    const [invited, rewarded, earned, referredBy, subscription, canBeReferred] = await Promise.all([
      this.prisma.referral.count({ where: { referrerId: userId } }),
      this.prisma.referral.count({ where: { referrerId: userId, rewardedAt: { not: null } } }),
      this.prisma.referral.aggregate({ where: { referrerId: userId }, _sum: { referrerDays: true } }),
      this.prisma.referral.findUnique({ where: { referredId: userId }, select: { id: true } }),
      this.prisma.subscription.findUnique({ where: { userId }, select: { bonusDays: true } }),
      this.isEligible({ userId })
    ]);

    return {
      code,
      link: webReferralLink({ clientUrl: this.config.get('CLIENT_URL'), code }),
      telegramLink: telegramReferralLink({ botUsername: this.config.get('TELEGRAM_BOT_USERNAME'), code }),
      invited,
      rewarded,
      daysEarned: earned._sum.referrerDays ?? 0,
      pendingDays: subscription?.bonusDays ?? 0,
      isReferred: isNonNullish(referredBy),
      canBeReferred
    };
  }

  async attribute({ userId, code, source }: AttributeInput): Promise<AttributeResult> {
    const owner = await this.prisma.referralCode.findUnique({ where: { code }, select: { userId: true } });

    if (isNullish(owner)) {
      throw new AppNotFoundException('REFERRAL_CODE_INVALID', 'No account holds this invite code');
    }

    if (owner.userId === userId) {
      throw new AppBadRequestException('REFERRAL_SELF', 'An account cannot invite itself');
    }

    if (!(await this.isEligible({ userId }))) {
      throw new AppBadRequestException('REFERRAL_UNAVAILABLE', 'Only a new account that has not paid yet can take an invite');
    }

    const mutual = await this.prisma.referral.findFirst({
      where: { referrerId: userId, referredId: owner.userId },
      select: { id: true }
    });

    if (isNonNullish(mutual)) {
      throw new AppBadRequestException('REFERRAL_SELF', 'Two accounts cannot invite each other');
    }

    try {
      await this.prisma.referral.create({ data: { referrerId: owner.userId, referredId: userId, source } });
    } catch (error) {
      if (isPrismaRequestError(error) && error.code === UNIQUE_VIOLATION) {
        throw new AppBadRequestException('REFERRAL_UNAVAILABLE', 'This account already took an invite');
      }

      throw error;
    }

    return { referrerId: owner.userId };
  }

  async adopt({ fromUserId, toUserId, db }: AdoptInput): Promise<void> {
    const referral = await db.referral.findUnique({
      where: { referredId: fromUserId },
      select: { id: true, referrerId: true, rewardedAt: true }
    });

    if (isNullish(referral) || isNonNullish(referral.rewardedAt) || referral.referrerId === toUserId) {
      return;
    }

    const mutual = await db.referral.findFirst({ where: { referrerId: toUserId, referredId: referral.referrerId }, select: { id: true } });

    if (isNonNullish(mutual) || !(await this.isEligible({ userId: toUserId, db }))) {
      return;
    }

    await db.referral.update({ where: { id: referral.id }, data: { referredId: toUserId } });
  }

  async isEligible({ userId, db = this.prisma }: EligibilityInput): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        referredBy: { select: { id: true } },
        payments: { where: { kind: 'subscription', status: 'succeeded' }, select: { id: true }, take: 1 }
      }
    });

    if (isNullish(user) || isNonNullish(user.referredBy) || user.payments.length > 0) {
      return false;
    }

    return isAfter(user.createdAt, subDays(new Date(), REFERRAL_POLICY.claimWindowDays));
  }

  private async ensureCode(userId: string): Promise<string> {
    for (let attempt = 0; attempt < REFERRAL_CODE_ATTEMPTS; attempt += 1) {
      const existing = await this.prisma.referralCode.findUnique({ where: { userId }, select: { code: true } });

      if (isNonNullish(existing)) {
        return existing.code;
      }

      try {
        const created = await this.prisma.referralCode.create({ data: { userId, code: generateReferralCode() } });

        return created.code;
      } catch (error) {
        if (!isPrismaRequestError(error) || error.code !== UNIQUE_VIOLATION) {
          throw error;
        }
      }
    }

    throw new AppServiceUnavailableException('INTERNAL_ERROR', 'An invite code could not be issued');
  }
}
