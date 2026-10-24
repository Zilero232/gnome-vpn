import { findPlan } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addHours, subHours, subMinutes } from 'date-fns';
import { isNonNullish } from 'remeda';

import { describeError } from '@/common/lib';
import { AppConfigService } from '@/config';
import { PrismaService } from '@/core';
import { YooKassaClient } from '@/lib/yookassa';
import { CardService, CheckoutService, describeRenewal, renewalIdempotenceKey, WebhookService } from '@/modules/billing';
import { PENDING, WINDOW } from '@/modules/scheduler/config';
import { periodKind } from '@/modules/subscription';
import { TelegramAlertService, TelegramNotifyService } from '@/modules/telegram/notify';

import type { ChargeAttemptInput, DueSubscription } from './recurring-charge.job.types';

@Injectable()
export class RecurringChargeJob {
  private readonly logger = new Logger(RecurringChargeJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly yookassa: YooKassaClient,
    private readonly checkout: CheckoutService,
    private readonly card: CardService,
    private readonly webhook: WebhookService,
    private readonly notify: TelegramNotifyService,
    private readonly alerts: TelegramAlertService
  ) {}

  private async wasAttempted({ userId, currentPeriodEnd, paymentMethodId }: ChargeAttemptInput): Promise<boolean> {
    const attempt = await this.prisma.payment.findFirst({
      where: {
        userId,
        isAutoCharge: true,
        status: { in: ['pending', 'canceled'] },
        createdAt: { gt: subHours(currentPeriodEnd, WINDOW.renewHours) },
        OR: [{ paymentMethodId }, { paymentMethodId: null }]
      },
      select: { id: true }
    });

    return isNonNullish(attempt);
  }

  private async isPaidByHand(userId: string): Promise<boolean> {
    const pending = await this.prisma.payment.findFirst({
      where: {
        userId,
        kind: 'subscription',
        isAutoCharge: false,
        status: 'pending',
        createdAt: { gt: subMinutes(new Date(), PENDING.manualHoldMinutes) }
      },
      select: { id: true }
    });

    return isNonNullish(pending);
  }

  private async chargeIfDue(subscription: DueSubscription): Promise<void> {
    if (!subscription.savedCardId || !subscription.currentPeriodEnd || periodKind(subscription) === 'trial') {
      return;
    }

    const attempt = { userId: subscription.userId, currentPeriodEnd: subscription.currentPeriodEnd, paymentMethodId: subscription.savedCardId };

    if ((await this.wasAttempted(attempt)) || (await this.isPaidByHand(subscription.userId))) {
      return;
    }

    const plan = findPlan(subscription.plan);

    const payment = await this.yookassa.chargeRecurring({
      amountRub: plan.priceRub,
      description: describeRenewal(plan),
      paymentMethodId: subscription.savedCardId,
      idempotenceKey: renewalIdempotenceKey({
        userId: subscription.userId,
        currentPeriodEnd: subscription.currentPeriodEnd,
        paymentMethodId: subscription.savedCardId,
        amountRub: plan.priceRub
      })
    });

    await this.checkout.recordPendingPayment({
      userId: subscription.userId,
      paymentId: payment.id,
      plan,
      isAutoCharge: true,
      paymentMethodId: subscription.savedCardId
    });

    if (payment.status === 'pending') {
      return;
    }

    await this.webhook.settlePayment(payment.id);
  }

  private async dropUnusableCard(subscription: DueSubscription): Promise<void> {
    if (!subscription.savedCardId) {
      return;
    }

    const isUsable = await this.yookassa.isPaymentMethodUsable(subscription.savedCardId);

    if (isUsable !== false) {
      return;
    }

    await this.card.unbindCard(subscription.userId);

    this.logger.warn(`Dropped an unusable saved card for ${subscription.userId}`);

    await this.tellChargeFailed(subscription);
  }

  private async tellChargeFailed({ userId, currentPeriodEnd }: DueSubscription): Promise<void> {
    this.alerts.chargeFailed({ userId, reason: null, isCardDropped: true });

    await this.notify.tell({ userId, notice: 'chargeFailed', date: currentPeriodEnd });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async run(): Promise<void> {
    if (!this.config.get('yookassa').isRecurringEnabled) {
      return;
    }

    const due = await this.prisma.subscription.findMany({
      where: {
        cancelAtPeriodEnd: false,
        savedCardId: { not: null },
        currentPeriodEnd: {
          gt: new Date(),
          lt: addHours(new Date(), WINDOW.renewHours)
        }
      },
      select: { userId: true, savedCardId: true, plan: true, currentPeriodEnd: true, trialStartedAt: true }
    });

    for (const subscription of due) {
      try {
        await this.chargeIfDue(subscription);
      } catch (error) {
        this.logger.warn(`Recurring charge failed for ${subscription.userId}: ${describeError(error)}`);

        await this.dropUnusableCard(subscription).catch((checkError: unknown) => {
          this.logger.warn(`Could not check the saved card of ${subscription.userId}: ${describeError(checkError)}`);
        });
      }
    }
  }
}
