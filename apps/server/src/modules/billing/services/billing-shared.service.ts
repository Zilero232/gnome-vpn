import { findPlan } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';

import { AppConfigService } from '@/config';
import { PrismaService } from '@/core';

import type { ActivateInput, AttachMethodInput, CheckoutReturnInput, SetAutoRenewServiceInput } from '../billing.types';

import { localizedReturnUrl } from '../lib';
import { activationData } from '../webhook/settlement.helpers';
import { ACTIVATION_SELECT } from '../webhook/webhook.constants';

@Injectable()
export class BillingSharedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService
  ) {}

  isRecurringEnabled(): boolean {
    return this.config.get('yookassa').isRecurringEnabled;
  }

  returnUrl({ returnUrl, locale }: CheckoutReturnInput = {}): string {
    return returnUrl ?? localizedReturnUrl({ baseUrl: this.config.get('yookassa').returnUrl, locale });
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

  async activate({ userId, planId, method, orderedAt, db = this.prisma }: ActivateInput): Promise<void> {
    const subscription = await db.subscription.findUnique({ where: { userId }, select: ACTIVATION_SELECT });

    const data = activationData({
      subscription,
      plan: findPlan(planId),
      method,
      orderedAt,
      isRecurringEnabled: this.isRecurringEnabled()
    });

    await db.subscription.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    });
  }
}
