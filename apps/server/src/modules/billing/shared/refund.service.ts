import { Injectable, Logger } from '@nestjs/common';
import { isNonNullish, isNullish } from 'remeda';

import { PrismaService } from '@/core';
import { YooKassaClient } from '@/lib/yookassa';
import { SubscriptionPeriodService } from '@/modules/subscription';
import { TelegramAlertService } from '@/modules/telegram/notify';

import type { RefundOutcome, RefundReason, SettleResult } from './payment.types';
import type { RefundUnusableInput, UnusableReasonInput } from './refund.types';
import type { RevokePurchaseInput } from './settlement.types';

import { PAYMENT_SETTLE_SELECT, REFUND } from './payment.constants';
import { isPartialRefund, refundIdempotenceKey, refundReason } from './refund.helpers';
import { purchaseOf } from './settlement.helpers';
import { SubscriptionGrantService } from './subscription-grant.service';

@Injectable()
export class RefundService {
  private readonly logger = new Logger(RefundService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly yookassa: YooKassaClient,
    private readonly grants: SubscriptionGrantService,
    private readonly periods: SubscriptionPeriodService,
    private readonly alerts: TelegramAlertService
  ) {}

  async handleRefund(refundId: string): Promise<RefundOutcome | null> {
    const refund = await this.yookassa.getRefund(refundId);

    if (refund.status !== 'succeeded') {
      this.logger.debug(`refund ${refundId} is still ${refund.status}`);

      return null;
    }

    const row = await this.prisma.payment.findUnique({ where: { yookassaPaymentId: refund.paymentId }, select: PAYMENT_SETTLE_SELECT });

    if (isNullish(row)) {
      this.logger.warn(`refund ${refundId} for an unknown payment ${refund.paymentId}`);

      return null;
    }

    if (row.status !== 'succeeded') {
      this.logger.debug(`refund ${refundId}: payment ${refund.paymentId} is ${row.status}, nothing to take back`);

      return null;
    }

    const payment = await this.yookassa.getPayment(refund.paymentId);

    if (isPartialRefund({ refundedRub: payment.refundedRub, amount: row.amount })) {
      this.logger.warn(
        `payment ${refund.paymentId} was refunded in part (${payment.refundedRub} of ${row.amount.toFixed(2)}): the period is left as it is, review it by hand`
      );

      this.alerts.paymentRefunded({ userId: row.userId, purchase: row, amount: payment.refundedRub, reason: 'partial' });

      return null;
    }

    const purchase = purchaseOf(row);
    const outcome = await this.prisma.serializable((tx) => this.reverse({ row, purchase, db: tx }));

    if (outcome) {
      this.logger.log(`payment ${refund.paymentId} was refunded: ${outcome.kind} taken back from ${outcome.userId}`);

      this.alerts.paymentRefunded({ userId: outcome.userId, purchase: row, amount: row.amount.toNumber(), reason: 'manual' });
    }

    return outcome;
  }

  async unusableReason({ userId, purchase }: UnusableReasonInput): Promise<RefundReason | null> {
    const currentPeriodEnd = purchase.kind === 'extraDevices' && isNonNullish(userId) ? await this.periods.periodEnd(userId) : null;

    return refundReason({ userId, purchase, currentPeriodEnd, now: new Date() });
  }

  async refundUnusable({ row, reason }: RefundUnusableInput): Promise<SettleResult> {
    const paymentId = row.yookassaPaymentId;
    const amountRub = row.amount.toNumber();

    const refund = await this.yookassa.createRefund({
      paymentId,
      amountRub,
      description: REFUND.description[reason],
      idempotenceKey: refundIdempotenceKey(row.id)
    });

    if (refund.status === 'canceled') {
      this.logger.error(`the automatic refund of ${paymentId} (${reason}) was canceled by YooKassa — refund it by hand`);

      this.alerts.refundCanceled({ paymentId: row.id, userId: row.userId, purchase: row, amount: amountRub });

      return 'waiting';
    }

    const marked = await this.prisma.payment.updateMany({
      where: { id: row.id, status: 'pending' },
      data: { status: 'refunded' }
    });

    this.logger.warn(`payment ${paymentId} was refunded automatically: ${reason}`);

    if (marked.count === 1) {
      this.alerts.paymentRefunded({ userId: row.userId, purchase: row, amount: amountRub, reason });
    }

    return 'refunded';
  }

  private async reverse({ row, purchase, db }: RevokePurchaseInput): Promise<RefundOutcome | null> {
    const claimed = await db.payment.updateMany({
      where: { id: row.id, status: 'succeeded' },
      data: { status: 'refunded' }
    });

    if (claimed.count === 0) {
      return null;
    }

    return this.grants.revoke({ row, purchase, db });
  }
}
