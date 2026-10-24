import { findPlan } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';

import { extendPeriod, hasLapsedBeyondGrace } from '@/common/lib';
import { AppConfigService } from '@/config';
import { PrismaService } from '@/core';
import { periodKind } from '@/modules/subscription';

import type { ActivateInput, AttachMethodInput, AutoRenewInput, CheckoutReturnInput, SetAutoRenewServiceInput } from '../billing.types';

import { localizedReturnUrl } from '../lib';

@Injectable()
export class BillingSharedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService
  ) {}

  isRecurringEnabled(): boolean {
    return this.config.get('YOOKASSA_RECURRING');
  }

  returnUrl({ returnUrl, locale }: CheckoutReturnInput = {}): string {
    return returnUrl ?? localizedReturnUrl({ baseUrl: this.config.get('YOOKASSA_RETURN_URL'), locale });
  }

  async setAutoRenew({ userId, isEnabled }: SetAutoRenewServiceInput): Promise<void> {
    await this.prisma.subscription.update({
      where: { userId },
      data: { cancelAtPeriodEnd: !isEnabled }
    });
  }

  async attachPaymentMethod({ userId, paymentMethodId, title }: AttachMethodInput): Promise<void> {
    await this.prisma.subscription.update({
      where: { userId },
      data: {
        savedCardId: paymentMethodId,
        savedCardTitle: title,
        pendingCardId: null,
        cancelAtPeriodEnd: false
      }
    });
  }

  private resolveCancelAtPeriodEnd({ hasMethod, wasCancelled }: AutoRenewInput): boolean {
    if (!this.isRecurringEnabled() || !hasMethod) {
      return true;
    }

    return wasCancelled;
  }

  async activate({ userId, planId, method, orderedAt, db = this.prisma }: ActivateInput): Promise<void> {
    const subscription = await db.subscription.findUnique({
      where: { userId },
      select: {
        plan: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        savedCardId: true,
        trialStartedAt: true,
        bonusDays: true
      }
    });

    const plan = findPlan(planId);
    const bonusDays = subscription?.bonusDays ?? 0;
    const currentPeriodEnd = subscription?.currentPeriodEnd;
    const isConsentGiven = periodKind(subscription) !== 'paid' && Boolean(method?.id);
    const hadLapsedWhenOrdered = hasLapsedBeyondGrace({ currentPeriodEnd, at: orderedAt });

    const data = {
      plan: plan.id,
      currentPeriodEnd: extendPeriod({ currentPeriodEnd, months: plan.months, days: bonusDays }),
      bonusDays: 0,
      ...(hadLapsedWhenOrdered && { extraDevices: 0 }),
      cancelAtPeriodEnd: this.resolveCancelAtPeriodEnd({
        hasMethod: Boolean(method?.id ?? subscription?.savedCardId),
        wasCancelled: !isConsentGiven && (subscription?.cancelAtPeriodEnd ?? false)
      }),
      ...(method?.id ? { savedCardId: method.id, savedCardTitle: method.title } : {})
    };

    await db.subscription.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    });
  }
}
