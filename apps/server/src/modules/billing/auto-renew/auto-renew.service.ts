import { findPlan } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { addHours, subHours, subMinutes } from 'date-fns';
import { isNonNullish } from 'remeda';

import { AppBadRequestException } from '@/common/exceptions';
import { describeError } from '@/common/lib';
import { AppConfigService } from '@/config';
import { PrismaService } from '@/core';
import { YooKassaClient } from '@/lib/yookassa';
import { periodKind } from '@/modules/subscription';

import type { ChargeAttemptInput, DueSubscription } from './auto-renew.types';

import { CardService } from '../shared/card.service';
import { describeSubscription } from '../shared/description.helpers';
import { PaymentNoticeService } from '../shared/payment-notice.service';
import { PendingPaymentService } from '../shared/pending-payment.service';
import { SettlementService } from '../shared/settlement.service';
import { AUTO_RENEW, DUE_SUBSCRIPTION_SELECT } from './auto-renew.constants';
import { renewalIdempotenceKey } from './auto-renew.helpers';

@Injectable()
export class AutoRenewService {
  private readonly logger = new Logger(AutoRenewService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly yookassa: YooKassaClient,
    private readonly pending: PendingPaymentService,
    private readonly settlement: SettlementService,
    private readonly card: CardService,
    private readonly notices: PaymentNoticeService
  ) {}

  async cancelAutoRenew(userId: string): Promise<void> {
    await this.prisma.subscription.update({ where: { userId }, data: { cancelAtPeriodEnd: true } });
  }

  async resumeAutoRenew(userId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({ where: { userId }, select: { savedCardId: true } });

    if (!subscription?.savedCardId) {
      throw new AppBadRequestException('PAYMENT_METHOD_MISSING', 'No saved payment method');
    }

    await this.prisma.subscription.update({ where: { userId }, data: { cancelAtPeriodEnd: false } });
  }

  async dueSubscriptions(): Promise<DueSubscription[]> {
    if (!this.config.get('yookassa').isRecurringEnabled) {
      return [];
    }

    const now = new Date();

    return this.prisma.subscription.findMany({
      where: {
        cancelAtPeriodEnd: false,
        savedCardId: { not: null },
        currentPeriodEnd: { gt: now, lt: addHours(now, AUTO_RENEW.windowHours) }
      },
      select: DUE_SUBSCRIPTION_SELECT
    });
  }

  async chargeDue(subscription: DueSubscription): Promise<void> {
    try {
      await this.charge(subscription);
    } catch (error) {
      this.logger.warn(`Recurring charge failed for ${subscription.userId}: ${describeError(error)}`);

      await this.dropUnusableCard(subscription).catch((checkError: unknown) => {
        this.logger.warn(`Could not check the saved card of ${subscription.userId}: ${describeError(checkError)}`);
      });
    }
  }

  private async charge(subscription: DueSubscription): Promise<void> {
    const { userId, savedCardId, currentPeriodEnd } = subscription;

    if (!savedCardId || !currentPeriodEnd || periodKind(subscription) === 'trial') {
      return;
    }

    if ((await this.wasAttempted({ userId, currentPeriodEnd, paymentMethodId: savedCardId })) || (await this.isPaidByHand(userId))) {
      return;
    }

    const plan = findPlan(subscription.plan);

    const payment = await this.yookassa.chargeRecurring({
      amountRub: plan.priceRub,
      description: describeSubscription({ plan, kind: 'renewal' }),
      paymentMethodId: savedCardId,
      idempotenceKey: renewalIdempotenceKey({ userId, currentPeriodEnd, paymentMethodId: savedCardId, amountRub: plan.priceRub })
    });

    await this.pending.record({
      userId,
      paymentId: payment.id,
      plan,
      amountRub: plan.priceRub,
      kind: 'subscription',
      isAutoCharge: true,
      paymentMethodId: savedCardId
    });

    if (payment.status === 'pending') {
      return;
    }

    await this.settlement.settlePayment(payment.id);
  }

  private async wasAttempted({ userId, currentPeriodEnd, paymentMethodId }: ChargeAttemptInput): Promise<boolean> {
    const attempt = await this.prisma.payment.findFirst({
      where: {
        userId,
        isAutoCharge: true,
        status: { in: ['pending', 'canceled'] },
        createdAt: { gt: subHours(currentPeriodEnd, AUTO_RENEW.windowHours) },
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
        createdAt: { gt: subMinutes(new Date(), AUTO_RENEW.manualHoldMinutes) }
      },
      select: { id: true }
    });

    return isNonNullish(pending);
  }

  private async dropUnusableCard({ userId, savedCardId }: DueSubscription): Promise<void> {
    if (!savedCardId) {
      return;
    }

    const isUsable = await this.yookassa.isPaymentMethodUsable(savedCardId);

    if (isUsable !== false) {
      return;
    }

    await this.card.unbindCard(userId);

    this.logger.warn(`Dropped an unusable saved card for ${userId}`);

    await this.notices.chargeFailed({ userId, reason: null, isCardDropped: true });
  }
}
