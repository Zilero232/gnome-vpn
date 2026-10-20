import { PLANS } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { BOT_LOCALES, BOT_TEXT } from '../../../config';
import { fillLabel } from '../../fill-text';
import { parsePlanId, planButtonLabel, plansText } from '../plan-label';

const [plan] = PLANS;

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
