import { findPlan, MAX_EXTRA_DEVICES } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { addDays } from 'date-fns';
import { isNullish } from 'remeda';

import type {
  ActivateInput,
  AttachMethodInput,
  AutoRenewInput,
  CheckoutReturnInput,
  GrantExtraDevicesInput,
  RevokePeriodInput,
  SetAutoRenewServiceInput
} from '../billing.types';

import { hasLapsedBeyondGrace, nextPeriodEnd, rewindPeriod } from '../../../common/lib';
import { AppConfigService } from '../../../config';
import { PrismaService } from '../../../core';
import { periodKind } from '../../subscription';
import { localizedReturnUrl } from '../lib';

@Injectable()
export class BillingSharedService {
  private readonly logger = new Logger(BillingSharedService.name);

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
      currentPeriodEnd: addDays(nextPeriodEnd({ currentPeriodEnd, months: plan.months }), bonusDays),
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

  async grantExtraDevices({ userId, quantity, db = this.prisma }: GrantExtraDevicesInput): Promise<void> {
    const subscription = await db.subscription.findUnique({
      where: { userId },
      select: { extraDevices: true }
    });

    if (isNullish(subscription)) {
      this.logger.warn(`paid extra devices for ${userId} without a subscription row`);

      return;
    }

    const granted = Math.min(subscription.extraDevices + quantity, MAX_EXTRA_DEVICES);
    const dropped = subscription.extraDevices + quantity - granted;

    if (dropped > 0) {
      this.logger.error(
        `extra-devices overflow for ${userId}: paid ${quantity}, granted ${granted - subscription.extraDevices}, ${dropped} dropped over MAX ${MAX_EXTRA_DEVICES} — manual review needed`
      );
    }

    await db.subscription.update({
      where: { userId },
      data: { extraDevices: granted }
    });
  }

  async revokePeriod({ userId, months, db }: RevokePeriodInput): Promise<void> {
    const subscription = await db.subscription.findUnique({ where: { userId }, select: { currentPeriodEnd: true } });

    if (isNullish(subscription)) {
      return;
    }

    await db.subscription.update({
      where: { userId },
      data: { currentPeriodEnd: rewindPeriod({ currentPeriodEnd: subscription.currentPeriodEnd, months }), cancelAtPeriodEnd: true }
    });
  }

  async revokeExtraDevices({ userId, quantity, db = this.prisma }: GrantExtraDevicesInput): Promise<void> {
    const subscription = await db.subscription.findUnique({ where: { userId }, select: { extraDevices: true } });

    if (isNullish(subscription)) {
      return;
    }

    await db.subscription.update({
      where: { userId },
      data: { extraDevices: Math.max(0, subscription.extraDevices - quantity) }
    });
  }
}
