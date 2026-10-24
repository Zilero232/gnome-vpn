import { describe, expect, it } from 'vitest';

import type { PluralForms } from '../text.types';

import { countryFlag, fillTokens, pluralize } from '../text';

describe('countryFlag', () => {
  it('turns a two-letter code into its regional-indicator flag', () => {
    expect(countryFlag('NL')).toBe('🇳🇱');
  });

  it('reads the code regardless of case and stray spaces', () => {
    expect(countryFlag(' fi ')).toBe(countryFlag('FI'));
  });

  it('gives nothing for a code that is not two letters', () => {
    expect(countryFlag('')).toBe('');
    expect(countryFlag('NLD')).toBe('');
    expect(countryFlag('N1')).toBe('');
  });
});

const MONTHS: PluralForms = { one: 'месяц', few: 'месяца', many: 'месяцев' };

describe('pluralize', () => {
  it('picks the singular for one', () => {
    expect(pluralize({ count: 1, forms: MONTHS })).toBe('месяц');
  });

  it('picks the few form for two through four', () => {
    expect(pluralize({ count: 2, forms: MONTHS })).toBe('месяца');
    expect(pluralize({ count: 3, forms: MONTHS })).toBe('месяца');
    expect(pluralize({ count: 4, forms: MONTHS })).toBe('месяца');
  });

  it('picks the many form from five upwards', () => {
    expect(pluralize({ count: 5, forms: MONTHS })).toBe('месяцев');
    expect(pluralize({ count: 6, forms: MONTHS })).toBe('месяцев');
    expect(pluralize({ count: 12, forms: MONTHS })).toBe('месяцев');
  });

  it('picks the many form for zero', () => {
    expect(pluralize({ count: 0, forms: MONTHS })).toBe('месяцев');
  });

  it('follows the Russian teens rule, where eleven takes the many form', () => {
    expect(pluralize({ count: 11, forms: MONTHS })).toBe('месяцев');
    expect(pluralize({ count: 14, forms: MONTHS })).toBe('месяцев');
  });

  it('follows the Russian rule past twenty, where twenty-one takes the singular', () => {
    expect(pluralize({ count: 21, forms: MONTHS })).toBe('месяц');
    expect(pluralize({ count: 22, forms: MONTHS })).toBe('месяца');
    expect(pluralize({ count: 25, forms: MONTHS })).toBe('месяцев');
  });

  it('falls back to the many form when the matched category has no form', () => {
    expect(pluralize({ count: 1, forms: { many: 'штук' } })).toBe('штук');
  });

  it('works for any set of forms, not only months', () => {
    const devices: PluralForms = { one: 'устройство', few: 'устройства', many: 'устройств' };

    expect(pluralize({ count: 1, forms: devices })).toBe('устройство');
    expect(pluralize({ count: 3, forms: devices })).toBe('устройства');
    expect(pluralize({ count: 8, forms: devices })).toBe('устройств');
  });
});

describe('pluralize in another locale', () => {
  it('follows the rules of the locale it is given, so English has no few form', () => {
    const days: PluralForms = { one: 'day', many: 'days' };

    expect(pluralize({ count: 1, forms: days, locale: 'en' })).toBe('day');
    expect(pluralize({ count: 3, forms: days, locale: 'en' })).toBe('days');
  });
});

describe('fillTokens', () => {
  it('replaces every occurrence of a token and leaves the rest', () => {
    expect(fillTokens({ text: '{date} and {date}, {amount}', fill: { date: 'x' } })).toBe('x and x, {amount}');
  });

  it('puts a value in verbatim even when it looks like a replacement pattern', () => {
    for (const value of ["$'", '$&', '$`', '$$', '$1']) {
      expect(fillTokens({ text: 'paid {amount}', fill: { amount: value } })).toBe(`paid ${value}`);
    }
  });
});
