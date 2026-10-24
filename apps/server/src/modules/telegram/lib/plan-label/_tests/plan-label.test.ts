import { discountedPriceRub, PLANS } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { BOT_LOCALES, BOT_TEXT } from '@/modules/telegram/config';
import { fillLabel } from '@/modules/telegram/lib/fill-text';
import { isTelegramHtml } from '@/modules/telegram/lib/html';

import { checkoutIntro, parsePlanId, planButtonLabel, plansText } from '../plan-label';

const [plan] = PLANS;
const TERMS_URL = 'https://gnomevpn.test/terms';

describe('planButtonLabel', () => {
  it('names the term and the price of the plan it is given', () => {
    const label = planButtonLabel({ plan, locale: 'ru' });

    expect(label).toContain(String(plan.months));
    expect(label).toContain(String(plan.priceRub));
  });

  it('carries the month word of the locale it is asked for', () => {
    for (const locale of BOT_LOCALES) {
      expect(planButtonLabel({ plan, locale })).toContain(BOT_TEXT[locale].monthShort);
    }
  });

  it('labels every plan differently, so a button is never ambiguous', () => {
    const labels = PLANS.map((each) => planButtonLabel({ plan: each, locale: 'ru' }));

    expect(new Set(labels).size).toBe(PLANS.length);
  });
});

describe('plansText', () => {
  it('writes every price in the currency notation of its locale', () => {
    for (const locale of BOT_LOCALES) {
      const price = fillLabel({ text: BOT_TEXT[locale].planPrice, fill: { price: String(plan.priceRub) } });

      expect(plansText({ locale, isExtending: false })).toContain(price);
      expect(planButtonLabel({ plan, locale })).toContain(price);
    }
  });

  it('says the new term stacks on the current one while a paid period runs', () => {
    for (const locale of BOT_LOCALES) {
      expect(plansText({ locale, isExtending: true })).toContain(BOT_TEXT[locale].choosePlanStacked);
      expect(plansText({ locale, isExtending: false })).toContain(BOT_TEXT[locale].choosePlan);
    }
  });
});

describe('parsePlanId', () => {
  it('accepts every id we actually render', () => {
    for (const each of PLANS) {
      expect(parsePlanId(each.id)).toBe(each.id);
    }
  });

  it('refuses anything that is not a plan', () => {
    expect(parsePlanId('made-up')).toBeNull();
    expect(parsePlanId('')).toBeNull();
    expect(parsePlanId('__proto__')).toBeNull();
  });
});

describe('checkoutIntro', () => {
  const discount = { code: 'BLOGGER20', percent: 20 };
  const amountRub = discountedPriceRub({ priceRub: plan.priceRub, percent: discount.percent });

  it('states the amount actually charged', () => {
    for (const locale of BOT_LOCALES) {
      expect(checkoutIntro({ planId: plan.id, amountRub: plan.priceRub, discount: null, termsUrl: TERMS_URL, locale })).toContain(
        String(plan.priceRub)
      );

      expect(checkoutIntro({ planId: plan.id, amountRub, discount, termsUrl: TERMS_URL, locale })).toContain(String(amountRub));
    }
  });

  it('names the code, the percent and the full price only when a discount applies', () => {
    for (const locale of BOT_LOCALES) {
      const discounted = checkoutIntro({ planId: plan.id, amountRub, discount, termsUrl: TERMS_URL, locale });
      const plain = checkoutIntro({ planId: plan.id, amountRub: plan.priceRub, discount: null, termsUrl: TERMS_URL, locale });

      expect(discounted).toContain(discount.code);
      expect(discounted).toContain(`${discount.percent}%`);
      expect(discounted).toContain(String(plan.priceRub));
      expect(plain).not.toContain(discount.code);
      expect(isTelegramHtml(discounted)).toBe(true);
    }
  });

  it('ends with the link to the terms, discount or not', () => {
    for (const locale of BOT_LOCALES) {
      const discounted = checkoutIntro({ planId: plan.id, amountRub, discount, termsUrl: TERMS_URL, locale });
      const plain = checkoutIntro({ planId: plan.id, amountRub: plan.priceRub, discount: null, termsUrl: TERMS_URL, locale });

      expect(plain).toContain(`<a href="${TERMS_URL}">`);
      expect(discounted.indexOf(discount.code)).toBeLessThan(discounted.indexOf(TERMS_URL));
      expect(discounted.trimEnd().endsWith('</i>')).toBe(true);
      expect(isTelegramHtml(plain)).toBe(true);
    }
  });
});
