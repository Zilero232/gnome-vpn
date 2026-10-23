import type { LastPayment, SubscriptionStatus } from '@gnomevpn/schemas';

import { DEFAULT_PLAN_ID, resolveLimits } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { isNonNullish, isNullish } from 'remeda';

import { isPeriodActive, resolveStatus } from '../../../common/lib';
import { AppConfigService } from '../../../config';
import { PrismaService } from '../../../core';
import { trialState } from '../lib';
import { TrialGrantService } from './trial-grant.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly grants: TrialGrantService
  ) {}

  async hasActiveAccess(userId: string): Promise<boolean> {
    const row = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { currentPeriodEnd: true }
    });

    return isPeriodActive(row?.currentPeriodEnd);
  }

  async getStatus(userId: string): Promise<SubscriptionStatus> {
    const isRecurringAvailable = this.config.get('YOOKASSA_RECURRING');

    const [row, lastPayment] = await Promise.all([
      this.prisma.subscription.findUnique({
        where: { userId },
        select: {
          plan: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
          savedCardId: true,
          savedCardTitle: true,
          extraDevices: true,
          trialStartedAt: true
        }
      }),
      this.lastPayment(userId)
    ]);

    const trial = trialState(row);
    const isTrialAvailable = trial.isTrialAvailable && !(await this.grants.isGranted({ userId }));

    if (!row) {
      return {
        status: 'expired',
        plan: DEFAULT_PLAN_ID,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        hasPaymentMethod: false,
        savedCardTitle: null,
        isRecurringAvailable,
        period: 'none',
        isTrialAvailable,
        limits: resolveLimits(0),
        lastPayment
      };
    }

    return {
      status: resolveStatus(row.currentPeriodEnd),
      plan: row.plan,
      currentPeriodEnd: row.currentPeriodEnd ? row.currentPeriodEnd.toISOString() : null,
      cancelAtPeriodEnd: row.cancelAtPeriodEnd,
      hasPaymentMethod: isNonNullish(row.savedCardId),
      savedCardTitle: row.savedCardTitle,
      isRecurringAvailable,
      period: trial.period,
      isTrialAvailable,
      limits: resolveLimits(isPeriodActive(row.currentPeriodEnd) ? row.extraDevices : 0),
      lastPayment
    };
  }

  private async lastPayment(userId: string): Promise<LastPayment | null> {
    const payment = await this.prisma.payment.findFirst({
      where: { userId, kind: { not: 'gift' } },
      orderBy: { createdAt: 'desc' },
      select: { status: true, kind: true, isAutoCharge: true, createdAt: true }
    });

    if (isNullish(payment)) {
      return null;
    }

    return { ...payment, createdAt: payment.createdAt.toISOString() };
  }
}
