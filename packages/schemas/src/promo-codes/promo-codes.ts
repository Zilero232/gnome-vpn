import type { PlanId } from '../billing/plans';
import type { DiscountedPriceInput, PromoCodeOrigin } from './promo-codes.types';

import { findPlan } from '../billing/plans';
import { SHORT_CODE } from '../short-code';
import { GIFT_CODE, GIFT_PERIOD, PROMO_CODE, PROMO_DISCOUNT } from './promo-codes.constants';

const CODE_SHAPE = new RegExp(`^[A-Z0-9]{${PROMO_CODE.minLength},${PROMO_CODE.maxLength}}$`, 'u');

const FRIEND_SHAPE = new RegExp(`^[${SHORT_CODE.alphabet}]{${SHORT_CODE.length}}$`, 'u');

const GIFT_SHAPE = new RegExp(`^[${SHORT_CODE.alphabet}]{${GIFT_CODE.length}}$`, 'u');

const GIFT_GROUP = new RegExp(`.{1,${GIFT_CODE.groupSize}}`, 'gu');

export const normalisePromoCode = (raw: string): string =>
  raw
    .trim()
    .toUpperCase()
    .replaceAll(/[\s-]+/gu, '');

export const isPromoCode = (raw: string): boolean => CODE_SHAPE.test(normalisePromoCode(raw));

export const promoCodeOrigin = (raw: string): PromoCodeOrigin => {
  const code = normalisePromoCode(raw);

  if (FRIEND_SHAPE.test(code)) {
    return 'friend';
  }

  return GIFT_SHAPE.test(code) ? 'gift' : 'campaign';
};

export const formatGiftCode = (code: string): string => (code.match(GIFT_GROUP) ?? [code]).join(GIFT_CODE.separator);

export const discountedPriceRub = ({ priceRub, percent }: DiscountedPriceInput): number =>
  Math.max(PROMO_DISCOUNT.minPriceRub, Math.round((priceRub * (100 - percent)) / 100));

export const giftDays = (planId: PlanId): number => Math.round((findPlan(planId).months * GIFT_PERIOD.daysPerYear) / GIFT_PERIOD.monthsPerYear);
