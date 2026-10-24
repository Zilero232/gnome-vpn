import type { CheckoutResult } from '@gnomevpn/schemas';

import { extraDevicesPriceRub, findPlan, MAX_EXTRA_DEVICES } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { subMinutes } from 'date-fns';
import { randomUUID } from 'node:crypto';
import { isNullish } from 'remeda';

import { AppBadRequestException } from '@/common/exceptions';
import { describeError } from '@/common/lib';
import { AppConfigService } from '@/config';
import { PrismaService } from '@/core';
import { YooKassaClient } from '@/lib/yookassa';
import { PromoDiscountService } from '@/modules/promo-codes';
import { periodKind } from '@/modules/subscription';

import type {
  BuyExtraDevicesServiceInput,
  CheckoutOutcome,
  CheckoutReturnInput,
  ClaimedExtraDevicesInput,
  CreateCheckoutServiceInput,
  OpenedPayment,
  OpenPaymentInput,
  ReusablePaymentInput
} from './checkout.types';

import { describeExtraDevices, describeSubscription } from '../shared/description.helpers';
import { PendingPaymentService } from '../shared/pending-payment.service';
import { CHECKOUT_REUSE } from './checkout.constants';
import { localizedReturnUrl } from './checkout.helpers';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly yookassa: YooKassaClient,
    private readonly discounts: PromoDiscountService,
    private readonly pending: PendingPaymentService
  ) {}

  async createCheckout({ userId, planId, returnUrl, locale }: CreateCheckoutServiceInput): Promise<CheckoutOutcome> {
    const { plan, amountRub, discount } = await this.discounts.quote({ userId, planId });
    const target = this.returnUrl({ returnUrl, locale });
    const shown = discount && { code: discount.code, percent: discount.percent };

    const reused = await this.reusablePayment({
      userId,
      returnUrl: target,
      where: { kind: 'subscription', plan: plan.id, promoCodeId: discount?.promoCodeId ?? null, amount: amountRub }
    });

    if (reused) {
      return { ...reused, amountRub, discount: shown };
    }

    const payment = await this.openPayment({
      amountRub,
      description: describeSubscription({ plan, kind: 'purchase' }),
      returnUrl: target,
      savePaymentMethod: this.config.get('YOOKASSA_RECURRING')
    });

    await this.pending.record({ userId, paymentId: payment.id, plan, amountRub, kind: 'subscription', isAutoCharge: false, discount });

    return { confirmationUrl: payment.confirmationUrl, amountRub, discount: shown };
  }

  async buyGift({ userId, planId, returnUrl, locale }: CreateCheckoutServiceInput): Promise<CheckoutResult> {
    const plan = findPlan(planId);
    const target = this.returnUrl({ returnUrl, locale });

    const reused = await this.reusablePayment({ userId, returnUrl: target, where: { kind: 'gift', plan: plan.id } });

    if (reused) {
      return reused;
    }

    const payment = await this.openPayment({
      amountRub: plan.priceRub,
      description: describeSubscription({ plan, kind: 'gift' }),
      returnUrl: target,
      savePaymentMethod: false
    });

    await this.pending.record({ userId, paymentId: payment.id, plan, amountRub: plan.priceRub, kind: 'gift', isAutoCharge: false });

    return { confirmationUrl: payment.confirmationUrl };
  }

  async buyExtraDevices({ userId, quantity, returnUrl, locale }: BuyExtraDevicesServiceInput): Promise<CheckoutResult> {
    const target = this.returnUrl({ returnUrl, locale });

    const [subscription, claimed] = await Promise.all([
      this.prisma.subscription.findUnique({ where: { userId }, select: { currentPeriodEnd: true, trialStartedAt: true } }),
      this.claimedExtraDevices({ userId, db: this.prisma })
    ]);

    if (periodKind(subscription) !== 'paid') {
      throw new AppBadRequestException('SUBSCRIPTION_REQUIRED', 'Extra devices need a paid subscription; a trial does not count');
    }

    const reused = await this.reusablePayment({ userId, returnUrl: target, where: { kind: 'extraDevices', extraDevices: quantity } });

    if (reused) {
      return reused;
    }

    if (claimed + quantity > MAX_EXTRA_DEVICES) {
      throw new AppBadRequestException('EXTRA_DEVICES_LIMIT', `At most ${MAX_EXTRA_DEVICES} extra devices`);
    }

    const payment = await this.openPayment({
      amountRub: extraDevicesPriceRub(quantity),
      description: describeExtraDevices(quantity),
      returnUrl: target,
      savePaymentMethod: false
    });

    await this.prisma.serializable(async (tx) => {
      if ((await this.claimedExtraDevices({ userId, db: tx })) + quantity > MAX_EXTRA_DEVICES) {
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

  private returnUrl({ returnUrl, locale }: CheckoutReturnInput): string {
    return returnUrl ?? localizedReturnUrl({ baseUrl: this.config.get('YOOKASSA_RETURN_URL'), locale });
  }

  private async openPayment(input: OpenPaymentInput): Promise<OpenedPayment> {
    const payment = await this.yookassa.createPayment({ ...input, idempotenceKey: randomUUID() });

    if (!payment.confirmationUrl) {
      throw new AppBadRequestException('PAYMENT_FAILED', 'YooKassa returned no confirmation URL');
    }

    return { id: payment.id, confirmationUrl: payment.confirmationUrl };
  }

  private async claimedExtraDevices({ userId, db }: ClaimedExtraDevicesInput): Promise<number> {
    const [subscription, pending] = await Promise.all([
      db.subscription.findUnique({ where: { userId }, select: { extraDevices: true } }),
      db.payment.aggregate({ where: { userId, kind: 'extraDevices', status: 'pending' }, _sum: { extraDevices: true } })
    ]);

    return (subscription?.extraDevices ?? 0) + (pending._sum.extraDevices ?? 0);
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
