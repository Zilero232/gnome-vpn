import { Injectable, Logger } from '@nestjs/common';
import { isIncludedIn, isNonNullish, isNullish } from 'remeda';

import { describeError, errorCodeOf } from '@/common/lib';
import { PrismaService } from '@/core';
import { YooKassaClient } from '@/lib/yookassa';
import { SubscriptionAccessService } from '@/modules/subscription-link';

import type { SettleOutcome, SettleResult } from './payment.types';
import type { CancelInput, ClaimAndGrantInput } from './settlement.types';

import { CardService } from './card.service';
import { PaymentNoticeService } from './payment-notice.service';
import { CARD_LOST_REASONS, PAYMENT_SETTLE_SELECT } from './payment.constants';
import { RefundService } from './refund.service';
import { purchaseOf, savedMethodOf, settleCheck } from './settlement.helpers';
import { SubscriptionGrantService } from './subscription-grant.service';

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly yookassa: YooKassaClient,
    private readonly refunds: RefundService,
    private readonly grants: SubscriptionGrantService,
    private readonly card: CardService,
    private readonly access: SubscriptionAccessService,
    private readonly notices: PaymentNoticeService
  ) {}

  async settlePayment(paymentId: string): Promise<SettleResult> {
    const row = await this.prisma.payment.findUnique({ where: { yookassaPaymentId: paymentId }, select: PAYMENT_SETTLE_SELECT });

    if (isNullish(row)) {
      this.logger.warn(`webhook for an unknown payment ${paymentId}`);

      return 'unknown';
    }

    if (row.status !== 'pending') {
      this.logger.debug(`payment ${paymentId} is already ${row.status}`);

      return 'skipped';
    }

    const payment = await this.yookassa.getPayment(paymentId);
    const check = settleCheck(payment);

    if (check === 'canceled') {
      await this.cancel({ row, reason: payment.cancellationReason });

      return 'canceled';
    }

    if (check === 'waiting') {
      this.logger.debug(`payment ${paymentId} is still ${payment.status}`);

      return 'waiting';
    }

    if (check === 'refunded') {
      await this.prisma.payment.updateMany({ where: { id: row.id, status: 'pending' }, data: { status: 'refunded' } });
      this.logger.log(`payment ${paymentId} was refunded before it settled, nothing is granted`);

      return 'refunded';
    }

    const purchase = purchaseOf(row);
    const reason = await this.refunds.unusableReason({ userId: row.userId, purchase });

    if (reason) {
      return this.refunds.refundUnusable({ row, reason });
    }

    const { userId } = row;

    if (isNullish(userId)) {
      return 'skipped';
    }

    let settled: SettleOutcome | null;

    try {
      settled = await this.prisma.serializable((tx) => this.claimAndGrant({ row, userId, purchase, payment, db: tx }));
    } catch (error) {
      if (errorCodeOf(error) !== 'PROMO_CODE_ALREADY_USED') {
        throw error;
      }

      this.logger.warn(`payment ${paymentId} was priced with a discount another payment already used`);

      return this.refunds.refundUnusable({ row, reason: 'discountUsed' });
    }

    if (!settled) {
      return 'skipped';
    }

    if (purchase.kind !== 'gift') {
      await this.access.setEnabledAll({ userId, enabled: true }).catch((error: unknown) => {
        this.logger.error(`paid access for ${userId} was not re-enabled, the sweep will retry: ${describeError(error)}`);
      });
    }

    await this.notices.settled({ row, userId, purchase, outcome: settled });

    return 'settled';
  }

  private async claimAndGrant({ row, userId, purchase, payment, db }: ClaimAndGrantInput): Promise<SettleOutcome | null> {
    const claimed = await db.payment.updateMany({
      where: { id: row.id, status: 'pending' },
      data: { status: 'succeeded' }
    });

    if (claimed.count === 0) {
      this.logger.debug(`payment ${row.yookassaPaymentId} was claimed by a concurrent webhook`);

      return null;
    }

    return this.grants.grant({ row, userId, purchase, method: savedMethodOf(payment), db });
  }

  private async cancel({ row, reason }: CancelInput): Promise<void> {
    const claimed = await this.prisma.payment.updateMany({
      where: { id: row.id, status: 'pending' },
      data: { status: 'canceled' }
    });

    if (claimed.count === 0) {
      return;
    }

    this.logger.log(`payment ${row.yookassaPaymentId} was canceled: ${reason ?? 'no reason given'}`);

    const { userId } = row;

    if (!row.isAutoCharge || isNullish(userId)) {
      return;
    }

    const isCardLost = isNonNullish(reason) && isIncludedIn(reason, CARD_LOST_REASONS);

    if (isCardLost) {
      await this.card.unbindCard(userId);

      this.logger.warn(`Dropped the saved card of ${userId}: ${reason}`);
    }

    await this.notices.chargeFailed({ userId, reason, isCardDropped: isCardLost });
  }
}
