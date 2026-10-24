import type { WebhookEvent } from '@gnomevpn/schemas';

import { findPlan, formatGiftCode, giftDays } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isNonNullish, isNullish } from 'remeda';

import { describeError, errorCodeOf, hasLapsedBeyondGrace, paymentPlan } from '@/common/lib';
import { PrismaService } from '@/core';
import { YooKassaClient } from '@/lib/yookassa';
import { GiftCodeService, PromoDiscountService } from '@/modules/promo-codes';
import { ReferralRewardService } from '@/modules/referrals';
import { SubscriptionAccessService } from '@/modules/subscription-link';
import { TelegramAlertService, TelegramNotifyService } from '@/modules/telegram/notify';

import type {
  AnnounceReferralInput,
  CanceledPayment,
  RefundOutcome,
  RefundReason,
  RefundUnusableInput,
  ReverseRefundInput,
  SettledPayment,
  SettleOutcome,
  SettleResult,
  UnusablePayment
} from '../billing.types';

import { CARD_LOST_REASONS, REFUND, REFUND_DESCRIPTION, WEBHOOK_EVENT } from '../config';
import { BillingSharedService } from './billing-shared.service';
import { CardService } from './card.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly yookassa: YooKassaClient,
    private readonly shared: BillingSharedService,
    private readonly card: CardService,
    private readonly access: SubscriptionAccessService,
    private readonly notify: TelegramNotifyService,
    private readonly referralReward: ReferralRewardService,
    private readonly alerts: TelegramAlertService,
    private readonly discounts: PromoDiscountService,
    private readonly gifts: GiftCodeService
  ) {}

  async handleWebhook(event: WebhookEvent): Promise<void> {
    if (event.event === WEBHOOK_EVENT.methodActive) {
      await this.handlePaymentMethodActive(event.object.id);

      return;
    }

    if (event.event === WEBHOOK_EVENT.refundSucceeded) {
      await this.handleRefund(event.object.id);

      return;
    }

    if (!event.event.startsWith(WEBHOOK_EVENT.paymentPrefix)) {
      this.logger.debug(`ignoring webhook event ${event.event}`);

      return;
    }

    await this.settlePayment(event.object.id);
  }

  async settlePayment(paymentId: string): Promise<SettleResult> {
    const row = await this.prisma.payment.findUnique({
      where: { yookassaPaymentId: paymentId },
      select: {
        id: true,
        userId: true,
        status: true,
        plan: true,
        kind: true,
        extraDevices: true,
        isAutoCharge: true,
        amount: true,
        promoCodeId: true,
        createdAt: true
      }
    });

    if (isNullish(row)) {
      this.logger.warn(`webhook for an unknown payment ${paymentId}`);

      return 'unknown';
    }

    if (row.status !== 'pending') {
      this.logger.debug(`payment ${paymentId} is already ${row.status}`);

      return 'skipped';
    }

    const payment = await this.yookassa.getPayment(paymentId);

    if (payment.status === 'canceled') {
      await this.cancel({ ...row, paymentId, reason: payment.cancellationReason });

      return 'canceled';
    }

    if (payment.status !== 'succeeded') {
      this.logger.debug(`payment ${paymentId} is still ${payment.status}`);

      return 'waiting';
    }

    if (payment.refundedRub > 0) {
      await this.prisma.payment.updateMany({ where: { id: row.id, status: 'pending' }, data: { status: 'refunded' } });
      this.logger.log(`payment ${paymentId} was refunded before it settled, nothing is granted`);

      return 'refunded';
    }

    const refundReason = await this.unusableReason(row);

    if (refundReason) {
      return this.refundUnusable({ id: row.id, userId: row.userId, paymentId, amount: row.amount, reason: refundReason, purchase: row });
    }

    const userId = row.userId;

    if (isNullish(userId)) {
      return 'skipped';
    }

    let settled: SettleOutcome | null;

    try {
      settled = await this.prisma.serializable(async (tx): Promise<SettleOutcome | null> => {
        const claimed = await tx.payment.updateMany({
          where: { id: row.id, status: 'pending' },
          data: { status: 'succeeded' }
        });

        if (claimed.count === 0) {
          this.logger.debug(`payment ${paymentId} was claimed by a concurrent webhook`);

          return null;
        }

        if (row.kind === 'extraDevices') {
          await this.shared.grantExtraDevices({ userId, quantity: row.extraDevices, db: tx });

          return { referral: null, giftCode: null };
        }

        if (row.kind === 'gift') {
          const giftCode = await this.gifts.issue({ payment: { ...row, userId, plan: paymentPlan(row) }, db: tx });

          return { referral: null, giftCode };
        }

        if (row.promoCodeId) {
          await this.discounts.consume({ userId, promoCodeId: row.promoCodeId, paymentId: row.id, db: tx });
        }

        const planId = paymentPlan(row);

        await this.shared.activate({
          userId,
          planId,
          method: payment.paymentMethodId ? { id: payment.paymentMethodId, title: payment.paymentMethodTitle } : null,
          orderedAt: row.createdAt,
          db: tx
        });

        const referral = await this.referralReward.reward({ userId, planId, paymentId: row.id, db: tx });

        return { referral, giftCode: null };
      });
    } catch (error) {
      if (errorCodeOf(error) !== 'PROMO_CODE_ALREADY_USED') {
        throw error;
      }

      this.logger.warn(`payment ${paymentId} was priced with a discount another payment already used`);

      return this.refundUnusable({ id: row.id, userId, paymentId, amount: row.amount, reason: 'discountUsed', purchase: row });
    }

    if (!settled) {
      return 'skipped';
    }

    if (row.kind !== 'gift') {
      await this.access.setEnabledAll({ userId, enabled: true }).catch((error: unknown) => {
        this.logger.error(`paid access for ${userId} was not re-enabled, the sweep will retry: ${describeError(error)}`);
      });
    }

    this.alerts.paymentSettled({ userId, purchase: row, amount: row.amount.toNumber(), isAutoCharge: row.isAutoCharge });

    await this.announce({ ...row, userId, giftCode: settled.giftCode });

    if (settled.referral) {
      await this.announceReferral({ friendId: userId, outcome: settled.referral });
    }

    return 'settled';
  }

  async handleRefund(refundId: string): Promise<RefundOutcome | null> {
    const refund = await this.yookassa.getRefund(refundId);

    if (refund.status !== 'succeeded') {
      this.logger.debug(`refund ${refundId} is still ${refund.status}`);

      return null;
    }

    const row = await this.prisma.payment.findUnique({
      where: { yookassaPaymentId: refund.paymentId },
      select: { id: true, userId: true, status: true, kind: true, plan: true, extraDevices: true, amount: true }
    });

    if (isNullish(row)) {
      this.logger.warn(`refund ${refundId} for an unknown payment ${refund.paymentId}`);

      return null;
    }

    if (row.status !== 'succeeded') {
      this.logger.debug(`refund ${refundId}: payment ${refund.paymentId} is ${row.status}, nothing to take back`);

      return null;
    }

    const payment = await this.yookassa.getPayment(refund.paymentId);

    if (payment.refundedRub < row.amount.toNumber()) {
      this.logger.warn(
        `payment ${refund.paymentId} was refunded in part (${payment.refundedRub} of ${row.amount.toFixed(2)}): the period is left as it is, review it by hand`
      );

      this.alerts.paymentRefunded({ userId: row.userId, purchase: row, amount: payment.refundedRub, reason: 'partial' });

      return null;
    }

    const outcome = await this.prisma.serializable((tx) => this.reverse({ row, db: tx }));

    if (outcome) {
      this.logger.log(`payment ${refund.paymentId} was refunded: ${outcome.kind} taken back from ${outcome.userId}`);

      this.alerts.paymentRefunded({ userId: outcome.userId, purchase: row, amount: row.amount.toNumber(), reason: 'manual' });
    }

    return outcome;
  }

  private async reverse({ row, db }: ReverseRefundInput): Promise<RefundOutcome | null> {
    const claimed = await db.payment.updateMany({
      where: { id: row.id, status: 'succeeded' },
      data: { status: 'refunded' }
    });

    if (claimed.count === 0) {
      return null;
    }

    if (row.kind === 'gift') {
      const gift = await this.gifts.revoke({ paymentId: row.id, db });

      this.logger.log(`gift of payment ${row.id} disabled; ${gift?.days ?? 0} days taken back from ${gift?.redeemerId ?? 'nobody'}`);

      return { userId: row.userId, kind: row.kind, referral: null };
    }

    if (isNullish(row.userId)) {
      return null;
    }

    if (row.kind === 'extraDevices') {
      await this.shared.revokeExtraDevices({ userId: row.userId, quantity: row.extraDevices, db });

      return { userId: row.userId, kind: row.kind, referral: null };
    }

    await this.shared.revokePeriod({ userId: row.userId, months: findPlan(paymentPlan(row)).months, db });

    const referral = await this.referralReward.revoke({ paymentId: row.id, db });

    return { userId: row.userId, kind: row.kind, referral };
  }

  private async unusableReason({ userId, kind }: UnusablePayment): Promise<RefundReason | null> {
    if (isNullish(userId)) {
      return 'orphan';
    }

    if (kind !== 'extraDevices') {
      return null;
    }

    const subscription = await this.prisma.subscription.findUnique({ where: { userId }, select: { currentPeriodEnd: true } });

    return hasLapsedBeyondGrace({ currentPeriodEnd: subscription?.currentPeriodEnd, at: new Date() }) ? 'lapsed' : null;
  }

  private async refundUnusable({ id, userId, paymentId, amount, reason, purchase }: RefundUnusableInput): Promise<SettleResult> {
    const refund = await this.yookassa.createRefund({
      paymentId,
      amountRub: amount.toNumber(),
      description: REFUND_DESCRIPTION[reason],
      idempotenceKey: `${REFUND.idempotencePrefix}${id}`
    });

    if (refund.status === 'canceled') {
      this.logger.error(`the automatic refund of ${paymentId} (${reason}) was canceled by YooKassa — refund it by hand`);

      this.alerts.refundCanceled({ paymentId: id, userId, purchase, amount: amount.toNumber() });

      return 'waiting';
    }

    const marked = await this.prisma.payment.updateMany({
      where: { id, status: 'pending' },
      data: { status: 'refunded' }
    });

    this.logger.warn(`payment ${paymentId} was refunded automatically: ${reason}`);

    if (marked.count === 1) {
      this.alerts.paymentRefunded({ userId, purchase, amount: amount.toNumber(), reason });
    }

    return 'refunded';
  }

  private async announceReferral({ friendId, outcome }: AnnounceReferralInput): Promise<void> {
    try {
      await this.notify.tell({ userId: friendId, notice: 'referralBonus', days: outcome.friendDays });

      const { referrerId } = outcome;

      if (isNullish(referrerId)) {
        return;
      }

      if (outcome.referrerDays === 0) {
        this.logger.log(`referral reward for ${referrerId} skipped: the cap is reached`);

        return;
      }

      if (outcome.isBanked) {
        await this.notify.tell({ userId: referrerId, notice: 'referralBanked', days: outcome.referrerDays });

        return;
      }

      const subscription = await this.prisma.subscription.findUnique({
        where: { userId: referrerId },
        select: { currentPeriodEnd: true }
      });

      await this.notify.tell({
        userId: referrerId,
        notice: 'referralRewarded',
        days: outcome.referrerDays,
        date: subscription?.currentPeriodEnd
      });
    } catch (error) {
      this.logger.error(`the referral reward for the payment of ${friendId} was not announced: ${describeError(error)}`);
    }
  }

  private async cancel({ id, userId, isAutoCharge, paymentId, reason }: CanceledPayment): Promise<void> {
    const claimed = await this.prisma.payment.updateMany({
      where: { id, status: 'pending' },
      data: { status: 'canceled' }
    });

    if (claimed.count === 0) {
      return;
    }

    this.logger.log(`payment ${paymentId} was canceled: ${reason ?? 'no reason given'}`);

    if (!isAutoCharge || isNullish(userId)) {
      return;
    }

    const isCardLost = isNonNullish(reason) && CARD_LOST_REASONS.includes(reason);

    if (isCardLost) {
      await this.card.unbindCard(userId);

      this.logger.warn(`Dropped the saved card of ${userId}: ${reason}`);
    }

    this.alerts.chargeFailed({ userId, reason, isCardDropped: isCardLost });

    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { currentPeriodEnd: true }
    });

    await this.notify.tell({ userId, notice: 'chargeFailed', date: subscription?.currentPeriodEnd });
  }

  private async announce({ userId, kind, plan, isAutoCharge, amount, giftCode }: SettledPayment): Promise<void> {
    if (kind === 'extraDevices') {
      await this.notify.tell({ userId, notice: 'devicesAdded' });

      return;
    }

    if (kind === 'gift') {
      if (giftCode) {
        await this.notify.tell({
          userId,
          notice: 'giftPurchased',
          days: giftDays(paymentPlan({ kind, plan })),
          fill: { code: formatGiftCode(giftCode) }
        });
      }

      return;
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { currentPeriodEnd: true }
    });

    const date = subscription?.currentPeriodEnd;

    if (isAutoCharge) {
      await this.notify.tell({ userId, notice: 'renewed', date, fill: { amount: String(amount) } });

      return;
    }

    await this.notify.tell({ userId, notice: 'paid', date, invite: paymentPlan({ kind, plan }) });
  }

  private async handlePaymentMethodActive(paymentMethodId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { pendingCardId: paymentMethodId },
      select: { userId: true }
    });

    if (isNullish(subscription)) {
      return;
    }

    const method = await this.yookassa.getPaymentMethod(paymentMethodId);

    if (method.status !== 'active') {
      await this.prisma.subscription.update({
        where: { userId: subscription.userId },
        data: { pendingCardId: null }
      });

      return;
    }

    await this.shared.attachPaymentMethod({
      userId: subscription.userId,
      paymentMethodId,
      title: method.title
    });
  }
}
