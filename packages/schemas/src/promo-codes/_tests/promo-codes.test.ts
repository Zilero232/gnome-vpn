import { describe, expect, it } from 'vitest';

import { PLANS } from '../../billing/plans';
import { SHORT_CODE } from '../../short-code';
import { discountedPriceRub, formatGiftCode, giftDays, isPromoCode, normalisePromoCode, promoCodeOrigin } from '../promo-codes';
import { GIFT_CODE, GIFT_PERIOD, PROMO_CODE, PROMO_DISCOUNT } from '../promo-codes.constants';
import { optionalPromoCodeSchema, redeemPromoCodeSchema } from '../promo-codes.schemas';

const FRIEND_CODE = SHORT_CODE.alphabet.slice(0, SHORT_CODE.length);
const GIFT = SHORT_CODE.alphabet.slice(0, GIFT_CODE.length);

describe('normalisePromoCode', () => {
  it('accepts a code however it was capitalised, spaced or grouped', () => {
    expect(normalisePromoCode(' blogger 20 ')).toBe('BLOGGER20');
    expect(normalisePromoCode('abcd-efgh-jkmn')).toBe('ABCDEFGHJKMN');
  });
});

describe('isPromoCode', () => {
  it('accepts every length the format allows and nothing outside it', () => {
    expect(isPromoCode('A'.repeat(PROMO_CODE.minLength))).toBe(true);
    expect(isPromoCode('A'.repeat(PROMO_CODE.maxLength))).toBe(true);
    expect(isPromoCode('A'.repeat(PROMO_CODE.minLength - 1))).toBe(false);
    expect(isPromoCode('A'.repeat(PROMO_CODE.maxLength + 1))).toBe(false);
  });

  it('still accepts a friend code and a grouped gift code', () => {
    expect(isPromoCode(FRIEND_CODE)).toBe(true);
    expect(isPromoCode(formatGiftCode(GIFT))).toBe(true);
  });

  it('refuses anything but latin letters and digits', () => {
    expect(isPromoCode('ПРОМО2026')).toBe(false);
    expect(isPromoCode('BLOGGER_20')).toBe(false);
    expect(isPromoCode('<script>')).toBe(false);
  });
});

describe('promoCodeOrigin', () => {
  it('tells a friend code by its shape', () => {
    expect(promoCodeOrigin(FRIEND_CODE.toLowerCase())).toBe('friend');
  });

  it('tells a gift code by its shape, grouped or not', () => {
    expect(promoCodeOrigin(GIFT)).toBe('gift');
    expect(promoCodeOrigin(formatGiftCode(GIFT))).toBe('gift');
  });

  it('treats everything else as a campaign code', () => {
    expect(promoCodeOrigin('BLOGGER20')).toBe('campaign');
    expect(promoCodeOrigin(`${FRIEND_CODE.slice(0, -1)}0`)).toBe('campaign');
    expect(promoCodeOrigin(`${GIFT.slice(0, -1)}O`)).toBe('campaign');
  });
});

describe('formatGiftCode', () => {
  it('groups the code for reading and loses nothing on the way back', () => {
    const formatted = formatGiftCode(GIFT);

    expect(formatted.split(GIFT_CODE.separator).every((group) => group.length === GIFT_CODE.groupSize)).toBe(true);
    expect(normalisePromoCode(formatted)).toBe(GIFT);
  });
});

describe('discountedPriceRub', () => {
  it('takes the percent off and rounds to whole roubles', () => {
    for (const plan of PLANS) {
      for (const percent of [PROMO_DISCOUNT.minPercent, 15, 33, PROMO_DISCOUNT.maxPercent]) {
        const price = discountedPriceRub({ priceRub: plan.priceRub, percent });

        expect(Number.isInteger(price)).toBe(true);
        expect(Math.abs(price - (plan.priceRub * (100 - percent)) / 100)).toBeLessThanOrEqual(0.5);
      }
    }
  });

  it('never charges more than the full price and never less than the floor', () => {
    for (const plan of PLANS) {
      for (let percent = PROMO_DISCOUNT.minPercent; percent <= PROMO_DISCOUNT.maxPercent; percent += 1) {
        const price = discountedPriceRub({ priceRub: plan.priceRub, percent });

        expect(price).toBeLessThanOrEqual(plan.priceRub);
        expect(price).toBeGreaterThanOrEqual(PROMO_DISCOUNT.minPriceRub);
      }
    }
  });

  it('keeps the floor on a price the discount would round down to nothing', () => {
    expect(discountedPriceRub({ priceRub: 1, percent: PROMO_DISCOUNT.maxPercent })).toBe(PROMO_DISCOUNT.minPriceRub);
  });

  it('charges less for a larger discount', () => {
    for (const plan of PLANS) {
      expect(discountedPriceRub({ priceRub: plan.priceRub, percent: 50 })).toBeLessThan(discountedPriceRub({ priceRub: plan.priceRub, percent: 10 }));
    }
  });
});

describe('giftDays', () => {
  it('grants the length of the plan in days', () => {
    for (const plan of PLANS) {
      expect(giftDays(plan.id)).toBe(Math.round((plan.months * GIFT_PERIOD.daysPerYear) / GIFT_PERIOD.monthsPerYear));
    }
  });

  it('grants more days for a longer plan', () => {
    const byLength = [...PLANS].sort((left, right) => left.months - right.months);

    for (const [index, plan] of byLength.slice(1).entries()) {
      expect(giftDays(plan.id)).toBeGreaterThan(giftDays(byLength[index].id));
    }
  });
});

describe('redeemPromoCodeSchema', () => {
  it('normalises the code it accepts', () => {
    expect(redeemPromoCodeSchema.parse({ code: ' blogger-20 ' })).toEqual({ code: 'BLOGGER20' });
  });

  it('refuses a malformed code', () => {
    expect(redeemPromoCodeSchema.safeParse({ code: 'no' }).success).toBe(false);
    expect(redeemPromoCodeSchema.safeParse({ code: 42 }).success).toBe(false);
  });
});

describe('optionalPromoCodeSchema', () => {
  it('lets an empty field through untouched', () => {
    expect(optionalPromoCodeSchema.parse('  ')).toBe('');
  });

  it('normalises a filled one and refuses a malformed one', () => {
    expect(optionalPromoCodeSchema.parse(FRIEND_CODE.toLowerCase())).toBe(FRIEND_CODE);
    expect(optionalPromoCodeSchema.safeParse('a!').success).toBe(false);
  });
});
