import type { SubscriptionStatus } from '@gnomevpn/schemas';

import { DEFAULT_PLAN_ID, isPlaceholderEmail, TRIAL_DAYS } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { addDays } from 'date-fns';
import { isNonNullish, isNullish } from 'remeda';

import type { TransferTrialInput, TrialEligibility, TrialGrantLookupInput, TrialStanding } from '../subscription.types';

import { AppBadRequestException } from '../../../common/exceptions';
import { isPeriodActive } from '../../../common/lib';
import { isPrismaRequestError, PrismaService, UNIQUE_VIOLATION } from '../../../core';
import { trialState } from '../lib';
import { SubscriptionService } from './subscription.service';
import { TrialGrantService } from './trial-grant.service';

@Injectable()
export class TrialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscription: SubscriptionService,
    private readonly grants: TrialGrantService
  ) {}

  async eligibility(userId: string): Promise<TrialEligibility> {
    const { eligibility } = await this.standing(userId);

    return eligibility;
  }

  async standing(userId: string): Promise<TrialStanding> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true, subscription: { select: { currentPeriodEnd: true, trialStartedAt: true } } }
    });

    const hasAccess = isPeriodActive(user?.subscription?.currentPeriodEnd);

    if (!user || (!user.emailVerified && !isPlaceholderEmail(user.email))) {
      return { eligibility: 'emailUnverified', hasAccess };
    }

    const isAvailable = trialState(user.subscription).isTrialAvailable && !(await this.grants.isGranted({ userId }));

    return { eligibility: isAvailable ? 'available' : 'used', hasAccess };
  }

  async claim(userId: string): Promise<SubscriptionStatus> {
    const eligibility = await this.eligibility(userId);

    if (eligibility === 'emailUnverified') {
      throw new AppBadRequestException('TRIAL_EMAIL_UNVERIFIED', 'Confirm your email address before starting a trial');
    }

    if (eligibility === 'used') {
      throw new AppBadRequestException('TRIAL_ALREADY_USED', 'This account has already had its trial');
    }

    await this.grant(userId);

    return this.subscription.getStatus(userId);
  }

  async remember({ userId, db = this.prisma }: TrialGrantLookupInput): Promise<void> {
    const subscription = await db.subscription.findUnique({ where: { userId }, select: { trialStartedAt: true } });

    if (isNullish(subscription?.trialStartedAt)) {
      return;
    }

    await this.grants.record({ userId, db, isStrict: false });
  }

  async transfer({ fromUserId, toUserId, db }: TransferTrialInput): Promise<void> {
    const from = await db.subscription.findUnique({
      where: { userId: fromUserId },
      select: { trialStartedAt: true, currentPeriodEnd: true }
    });

    if (isNullish(from?.trialStartedAt)) {
      return;
    }

    await this.grants.record({ userId: fromUserId, db, isStrict: false });

    const to = await db.subscription.findUnique({
      where: { userId: toUserId },
      select: { trialStartedAt: true, currentPeriodEnd: true }
    });

    if (isNonNullish(to?.trialStartedAt) || isNonNullish(to?.currentPeriodEnd)) {
      return;
    }

    const period = { trialStartedAt: from.trialStartedAt, currentPeriodEnd: from.currentPeriodEnd };

    await db.subscription.upsert({
      where: { userId: toUserId },
      create: { userId: toUserId, plan: DEFAULT_PLAN_ID, ...period },
      update: period
    });
  }

  private async grant(userId: string): Promise<void> {
    const startedAt = new Date();
    const period = { trialStartedAt: startedAt, currentPeriodEnd: addDays(startedAt, TRIAL_DAYS) };

    try {
      await this.prisma.$transaction(async (tx) => {
        const updated = await tx.subscription.updateMany({
          where: { userId, trialStartedAt: null, currentPeriodEnd: null },
          data: period
        });

        if (updated.count === 0) {
          await tx.subscription.create({ data: { userId, plan: DEFAULT_PLAN_ID, ...period } });
        }

        await this.grants.record({ userId, db: tx, isStrict: true });
      });
    } catch (error) {
      if (isPrismaRequestError(error) && error.code === UNIQUE_VIOLATION) {
        return;
      }

      throw error;
    }
  }
}
