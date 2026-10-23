import type { PendingDiscount } from '@gnomevpn/schemas';

import { discountedPriceRub, findPlan } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { isNullish } from 'remeda';

import type { AppliedDiscount, CheckoutQuote, DiscountClaimInput, PendingDiscountInput, QuoteInput } from '../promo-codes.types';

import { AppBadRequestException } from '../../../common/exceptions';
import { PrismaService } from '../../../core';

@Injectable()
export class PromoDiscountService {
  constructor(private readonly prisma: PrismaService) {}

  async pending({ userId, db = this.prisma }: PendingDiscountInput): Promise<AppliedDiscount | null> {
    const redemption = await db.promoRedemption.findFirst({
      where: { userId, consumedAt: null, replacedAt: null, promoCode: { kind: 'discount' } },
      orderBy: { createdAt: 'desc' },
      select: { promoCode: { select: { id: true, code: true, percent: true } } }
    });

    const promo = redemption?.promoCode;

    if (isNullish(promo) || isNullish(promo.percent)) {
      return null;
    }

    return { promoCodeId: promo.id, code: promo.code, percent: promo.percent };
  }

  async overview(userId: string): Promise<PendingDiscount> {
    const discount = await this.pending({ userId });

    return { discount: discount && { code: discount.code, percent: discount.percent } };
  }

  async quote({ userId, planId }: QuoteInput): Promise<CheckoutQuote> {
    const plan = findPlan(planId);
    const discount = await this.pending({ userId });
    const amountRub = isNullish(discount) ? plan.priceRub : discountedPriceRub({ priceRub: plan.priceRub, percent: discount.percent });

    return { plan, amountRub, discount };
  }

  async consume({ userId, promoCodeId, paymentId, db }: DiscountClaimInput): Promise<void> {
    const claimed = await db.promoRedemption.updateMany({
      where: { promoCodeId, userId, consumedAt: null },
      data: { consumedAt: new Date(), paymentId }
    });

    if (claimed.count === 0) {
      throw new AppBadRequestException('PROMO_CODE_ALREADY_USED', 'The discount this payment was priced with is already used');
    }
  }
}
