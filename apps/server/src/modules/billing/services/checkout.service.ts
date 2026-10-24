import type { CheckoutResult } from '@gnomevpn/schemas';

import { extraDevicesPriceRub, findPlan, MAX_EXTRA_DEVICES } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { subMinutes } from 'date-fns';
import { randomUUID } from 'node:crypto';
import { isNullish } from 'remeda';

import { AppBadRequestException } from '@/common/exceptions';
import { describeError } from '@/common/lib';
import { PrismaService } from '@/core';
import { YooKassaClient } from '@/lib/yookassa';
import { PromoDiscountService } from '@/modules/promo-codes';
import { periodKind } from '@/modules/subscription';

import type {
  BuyExtraDevicesServiceInput,
  BuyGiftServiceInput,
  CheckoutOutcome,
  CreateCheckoutServiceInput,
  RecordPaymentInput,
  ReusablePaymentInput
} from '../billing.types';

import { CHECKOUT_REUSE } from '../config';
import { describeExtraDevices, describeGift, describePlan } from '../lib';
import { BillingSharedService } from './billing-shared.service';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly yookassa: YooKassaClient,
    private readonly shared: BillingSharedService,
    private readonly discounts: PromoDiscountService
  ) {}

  async createCheckout({ userId, planId, returnUrl, locale }: CreateCheckoutServiceInput): Promise<CheckoutOutcome> {
    const { plan, amountRub, discount } = await this.discounts.quote({ userId, planId });
    const target = this.shared.returnUrl({ returnUrl, locale });
    const shown = discount && { code: discount.code, percent: discount.percent };

    const reused = await this.reusablePayment({
      userId,
      returnUrl: target,
      where: { kind: 'subscription', plan: plan.id, promoCodeId: discount?.promoCodeId ?? null, amount: amountRub }
    });

    if (reused) {
      return { ...reused, amountRub, discount: shown };
    }

    const payment = await this.yookassa.createPayment({
      amountRub,
      description: describePlan(plan),
      returnUrl: target,
      idempotenceKey: randomUUID(),
      savePaymentMethod: this.shared.isRecurringEnabled()
    });

    if (!payment.confirmationUrl) {
      throw new AppBadRequestException('PAYMENT_FAILED', 'YooKassa returned no confirmation URL');
    }

    await this.recordPendingPayment({
      userId,
      paymentId: payment.id,
      plan,
      isAutoCharge: false,
      amountRub,
      discount
    });

    return { confirmationUrl: payment.confirmationUrl, amountRub, discount: shown };
  }

  async buyGift({ userId, planId, returnUrl, locale }: BuyGiftServiceInput): Promise<CheckoutResult> {
    const plan = findPlan(planId);
    const target = this.shared.returnUrl({ returnUrl, locale });

    const reused = await this.reusablePayment({
      userId,
      returnUrl: target,
      where: { kind: 'gift', plan: plan.id }
    });

    if (reused) {
      return reused;
    }

    const payment = await this.yookassa.createPayment({
      amountRub: plan.priceRub,
      description: describeGift(plan),
      returnUrl: target,
      idempotenceKey: randomUUID(),
      savePaymentMethod: false
    });

    if (!payment.confirmationUrl) {
      throw new AppBadRequestException('PAYMENT_FAILED', 'YooKassa returned no confirmation URL');
    }

    await this.recordPendingPayment({
      userId,
      paymentId: payment.id,
      plan,
      isAutoCharge: false,
      kind: 'gift'
    });

    return { confirmationUrl: payment.confirmationUrl };
  }

  async buyExtraDevices({ userId, quantity, returnUrl, locale }: BuyExtraDevicesServiceInput): Promise<CheckoutResult> {
    const target = this.shared.returnUrl({ returnUrl, locale });

    const [subscription, pending] = await Promise.all([
      this.prisma.subscription.findUnique({
        where: { userId },
        select: { extraDevices: true, currentPeriodEnd: true, trialStartedAt: true }
      }),
      this.prisma.payment.aggregate({
        where: { userId, kind: 'extraDevices', status: 'pending' },
        _sum: { extraDevices: true }
      })
    ]);

    if (periodKind(subscription) !== 'paid') {
      throw new AppBadRequestException('SUBSCRIPTION_REQUIRED', 'Extra devices need a paid subscription; a trial does not count');
    }

    const reused = await this.reusablePayment({
      userId,
      returnUrl: target,
      where: { kind: 'extraDevices', extraDevices: quantity }
    });

    if (reused) {
      return reused;
    }

    const claimed = (subscription?.extraDevices ?? 0) + (pending._sum.extraDevices ?? 0);

    if (claimed + quantity > MAX_EXTRA_DEVICES) {
      throw new AppBadRequestException('EXTRA_DEVICES_LIMIT', `At most ${MAX_EXTRA_DEVICES} extra devices`);
    }

    const payment = await this.yookassa.createPayment({
      amountRub: extraDevicesPriceRub(quantity),
      description: describeExtraDevices(quantity),
      returnUrl: target,
      idempotenceKey: randomUUID(),
      savePaymentMethod: false
    });

    if (!payment.confirmationUrl) {
      throw new AppBadRequestException('PAYMENT_FAILED', 'YooKassa returned no confirmation URL');
    }

    await this.prisma.serializable(async (tx) => {
      const [current, pendingNow] = await Promise.all([
        tx.subscription.findUnique({ where: { userId }, select: { extraDevices: true } }),
        tx.payment.aggregate({
          where: { userId, kind: 'extraDevices', status: 'pending' },
          _sum: { extraDevices: true }
        })
      ]);

      const claimedNow = (current?.extraDevices ?? 0) + (pendingNow._sum.extraDevices ?? 0);

      if (claimedNow + quantity > MAX_EXTRA_DEVICES) {
        throw new AppBadRequestException('EXTRA_DEVICES_LIMIT', `At most ${MAX_EXTRA_DEVICES} extra devices`);
      }

      await tx.payment.create({
        data: {
          userId,
          yookassaPaymentId: payment.id,
          amount: extraDevicesPriceRub(quantity),
          status: 'pending',
          isAutoCharge: false,
          kind: 'extraDevices',
          extraDevices: quantity
        }
      });
    });

    return { confirmationUrl: payment.confirmationUrl };
  }

  async recordPendingPayment({
    userId,
    paymentId,
    plan,
    isAutoCharge,
    paymentMethodId = null,
    kind = 'subscription',
    amountRub = plan.priceRub,
    discount = null
  }: RecordPaymentInput): Promise<void> {
    await this.prisma.payment.upsert({
      where: { yookassaPaymentId: paymentId },
      update: {},
      create: {
        userId,
        yookassaPaymentId: paymentId,
        amount: amountRub,
        status: 'pending',
        isAutoCharge,
        paymentMethodId,
        kind,
        plan: plan.id,
        promoCodeId: discount?.promoCodeId ?? null,
        discountPercent: discount?.percent ?? null
      }
    });
  }

  private async reusablePayment({ userId, returnUrl, where }: ReusablePaymentInput): Promise<CheckoutResult | null> {
    const row = await this.prisma.payment.findFirst({
      where: {
        ...where,
        userId,
        status: 'pending',
        isAutoCharge: false,
        createdAt: { gt: subMinutes(new Date(), CHECKOUT_REUSE.windowMinutes) }
      },
      orderBy: { createdAt: 'desc' },
      select: { yookassaPaymentId: true }
    });

    if (isNullish(row)) {
      return null;
    }

    try {
      const payment = await this.yookassa.getPayment(row.yookassaPaymentId);

      if (payment.status !== 'pending' || !payment.confirmationUrl || payment.returnUrl !== returnUrl) {
        return null;
      }

      return { confirmationUrl: payment.confirmationUrl };
    } catch (error) {
      this.logger.warn(`could not re-read pending payment ${row.yookassaPaymentId}, opening a new one: ${describeError(error)}`);

      return null;
    }
  }
}
