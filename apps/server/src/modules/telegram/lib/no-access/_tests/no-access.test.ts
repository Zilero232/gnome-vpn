import { describe, expect, it } from 'vitest';

import { BOT_TEXT } from '@/modules/telegram/config';

import { noAccessText } from '../no-access';

const never = { period: 'none', currentPeriodEnd: null, isTrialAvailable: true } as const;

describe('noAccessText', () => {
  it('offers the free day to someone who never had access', () => {
    expect(noAccessText({ status: never, locale: 'ru' })).toBe(BOT_TEXT.ru.noSubscription);
  });

  it('tells a former subscriber the subscription ended rather than offering a trial they cannot take', () => {
    const lapsed = { ...never, currentPeriodEnd: '2026-01-01T00:00:00.000Z', isTrialAvailable: false };

    expect(noAccessText({ status: lapsed, locale: 'ru' })).toBe(BOT_TEXT.ru.lapsed);
  });

  it('does not offer a free day that is no longer available', () => {
    expect(noAccessText({ status: { ...never, isTrialAvailable: false }, locale: 'en' })).toBe(BOT_TEXT.en.inactive);
  });
});
