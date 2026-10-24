import { discountedPriceRub, PLANS } from '@gnomevpn/schemas';
import { millisecondsInDay } from 'date-fns/constants';
import { describe, expect, it } from 'vitest';

import type { BotMessage } from '@/modules/telegram/telegram.types';

import { BOT_LOCALES, BOT_TEXT, CALLBACK_PREFIX, CALLBACK_VALUE } from '@/modules/telegram/config';
import { fillLabel, fillText, html, isTelegramHtml } from '@/modules/telegram/shared/text';

import type { StatusTextInput } from '../subscription.types';

import { autoRenewPanel, checkoutIntro, daysLeft, linkMessage, planButtonLabel, plansText, statusText } from '../subscription-view';

const active: StatusTextInput = {
  locale: 'ru',
  period: 'paid',
  plan: 'monthly',
  currentPeriodEnd: '2026-12-31T00:00:00.000Z',
  cancelAtPeriodEnd: false,
  hasPaymentMethod: true,
  isRecurringAvailable: true,
  limits: { deviceLimit: 2, extraDevices: 0, pricePerDeviceRub: 100, maxExtraDevices: 5 },
  deviceCount: 1
};

describe('statusText', () => {
  it('names the date the access runs out, which is the one thing the reader opened it for', () => {
    expect(statusText(active)).toContain('2026');
  });

  it('reports the device limit including whatever was bought on top of the plan', () => {
    const withExtra = { ...active, limits: { ...active.limits, deviceLimit: 5, extraDevices: 3 } };

    expect(statusText(withExtra)).toContain('5');
  });

  it('reports the devices in use against the limit, the way /devices does', () => {
    expect(statusText({ ...active, deviceCount: 1 })).toContain(
      fillText({ text: BOT_TEXT.ru.statusDevices, fill: { count: '1', limit: String(active.limits.deviceLimit) } })
    );
  });

  it('says something different about renewal depending on whether it will renew', () => {
    const renewing = statusText(active);
    const cancelled = statusText({ ...active, cancelAtPeriodEnd: true });

    expect(renewing).not.toBe(cancelled);
    expect(renewing).toContain(BOT_TEXT.ru.willRenew);
    expect(cancelled).toContain(BOT_TEXT.ru.willNotRenew);
  });

  it('does not promise an automatic renewal when there is no card to charge', () => {
    expect(statusText({ ...active, hasPaymentMethod: false })).toContain(BOT_TEXT.ru.renewManual);
  });

  it('does not promise an automatic renewal while recurring charges are switched off', () => {
    expect(statusText({ ...active, isRecurringAvailable: false })).toContain(BOT_TEXT.ru.renewManual);
  });

  it('falls back to the inactive copy for an expired subscription rather than rendering a stale date', () => {
    expect(statusText({ ...active, period: 'none' })).toBe(BOT_TEXT.ru.inactive);
  });

  it('treats a missing period as no access rather than formatting an invalid date', () => {
    expect(statusText({ ...active, currentPeriodEnd: null })).toBe(BOT_TEXT.ru.inactive);
  });

  it('answers in the locale it was given, not in one fixed language', () => {
    const russian = statusText(active);
    const english = statusText({ ...active, locale: 'en' });

    expect(russian).not.toBe(english);
    expect(english).toContain(BOT_TEXT.en.willRenew);
  });

  it('calls a trial a trial rather than the plan the row happens to carry', () => {
    const trial = statusText({ ...active, period: 'trial' });

    expect(trial).toContain(BOT_TEXT.ru.trialPeriod);
    expect(trial).not.toContain(BOT_TEXT.ru.monthShort);
  });

  it('tells a trial reader what happens next instead of talking about renewal', () => {
    const trial = statusText({ ...active, period: 'trial' });

    expect(trial).toContain(BOT_TEXT.ru.trialEnds);
    expect(trial).not.toContain(BOT_TEXT.ru.willRenew);
    expect(trial).not.toContain(BOT_TEXT.ru.willNotRenew);
  });

  it('names the plan by its term rather than by the id the database stores', () => {
    for (const plan of PLANS) {
      const rendered = statusText({ ...active, plan: plan.id });

      expect(rendered).toContain(String(plan.months));
      expect(rendered).not.toContain(plan.id);
    }
  });
});

describe('daysLeft', () => {
  const now = new Date('2026-10-01T12:00:00.000Z');

  it('rounds a part-day up, so a trial with hours left never reads as zero days', () => {
    expect(daysLeft({ until: new Date('2026-10-01T15:00:00.000Z'), now, locale: 'en' })).toBe(`1 ${BOT_TEXT.en.dayOne}`);
  });

  it('says zero once the period is over rather than a negative count', () => {
    expect(daysLeft({ until: new Date('2026-09-30T12:00:00.000Z'), now, locale: 'en' })).toBe(`0 ${BOT_TEXT.en.dayMany}`);
  });

  it('picks the Russian form the number takes', () => {
    const inDays = (days: number) => daysLeft({ until: new Date(now.getTime() + days * millisecondsInDay), now, locale: 'ru' });

    expect(inDays(1)).toBe(`1 ${BOT_TEXT.ru.dayOne}`);
    expect(inDays(3)).toBe(`3 ${BOT_TEXT.ru.dayFew}`);
    expect(inDays(5)).toBe(`5 ${BOT_TEXT.ru.dayMany}`);
    expect(inDays(21)).toBe(`21 ${BOT_TEXT.ru.dayOne}`);
  });
});

describe('statusText markup', () => {
  it('is markup Telegram accepts, in every state and language', () => {
    for (const locale of BOT_LOCALES) {
      for (const overrides of [{}, { period: 'trial' as const }, { cancelAtPeriodEnd: true }, { period: 'none' as const }]) {
        expect(isTelegramHtml(statusText({ ...active, ...overrides, locale }))).toBe(true);
      }
    }
  });
});

const paid = {
  period: 'paid' as const,
  cancelAtPeriodEnd: false,
  hasPaymentMethod: true,
  isRecurringAvailable: true,
  isTrialAvailable: false,
  currentPeriodEnd: '2026-12-31T00:00:00.000Z'
};

const callbacks = (panel: BotMessage): string[] =>
  panel.markup?.inline_keyboard.flat().flatMap((button) => ('callback_data' in button ? [button.callback_data] : [])) ?? [];

describe('autoRenewPanel', () => {
  it('offers to turn renewal off while it is on', () => {
    const panel = autoRenewPanel({ status: paid, locale: 'en' });

    expect(panel.text).toBe(BOT_TEXT.en.autoRenewOn);
    expect(callbacks(panel)).toEqual([`${CALLBACK_PREFIX.autoRenew}${CALLBACK_VALUE.switch.off}`]);
  });

  it('offers to turn it back on while a card is there to charge', () => {
    const panel = autoRenewPanel({ status: { ...paid, cancelAtPeriodEnd: true }, locale: 'en' });

    expect(callbacks(panel)).toEqual([`${CALLBACK_PREFIX.autoRenew}${CALLBACK_VALUE.switch.on}`]);
  });

  it('sends a reader with no card to the site rather than offering a switch that cannot work', () => {
    const panel = autoRenewPanel({ status: { ...paid, cancelAtPeriodEnd: true, hasPaymentMethod: false }, locale: 'en' });

    expect(panel.text).toBe(BOT_TEXT.en.autoRenewNeedsCard);
    expect(callbacks(panel).some((data) => data.startsWith(CALLBACK_PREFIX.autoRenew))).toBe(false);
  });

  it('does not claim renewal is on for a subscription that has already lapsed', () => {
    expect(autoRenewPanel({ status: { ...paid, period: 'none' }, locale: 'en' }).text).toBe(BOT_TEXT.en.inactive);
  });

  it('does not offer a switch while the shop cannot charge recurrently at all', () => {
    const panel = autoRenewPanel({ status: { ...paid, isRecurringAvailable: false }, locale: 'en' });

    expect(panel.text).toBe(BOT_TEXT.en.autoRenewUnavailable);
    expect(callbacks(panel).some((data) => data.startsWith(CALLBACK_PREFIX.autoRenew))).toBe(false);
  });

  it('never offers renewal on a trial, which is never charged', () => {
    expect(autoRenewPanel({ status: { ...paid, period: 'trial' }, locale: 'en' }).text).toBe(BOT_TEXT.en.autoRenewTrial);
  });
});

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

const url = 'https://vpn.example.com/sub/abc?x=1&y=2';

describe('linkMessage', () => {
  it('shows the link escaped, so a query string cannot break the markup', () => {
    for (const locale of BOT_LOCALES) {
      const { text } = linkMessage({ locale, intro: BOT_TEXT[locale].linkIntro, url });

      expect(isTelegramHtml(text)).toBe(true);
      expect(html.strip(text)).toContain(url);
    }
  });

  it('offers a button that copies exactly the link', () => {
    const { markup } = linkMessage({ locale: 'en', intro: 'x', url });
    const copied = markup?.inline_keyboard.flat().flatMap((button) => ('copy_text' in button ? [button.copy_text.text] : []));

    expect(copied).toEqual([url]);
  });
});
