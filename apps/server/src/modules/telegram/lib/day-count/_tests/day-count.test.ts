import { describe, expect, it } from 'vitest';

import { dayCount } from '../day-count';

describe('dayCount', () => {
  it('declines the Russian noun by the number', () => {
    expect(dayCount({ days: 1, locale: 'ru' })).toBe('1 день');
    expect(dayCount({ days: 3, locale: 'ru' })).toBe('3 дня');
    expect(dayCount({ days: 7, locale: 'ru' })).toBe('7 дней');
    expect(dayCount({ days: 21, locale: 'ru' })).toBe('21 день');
  });

  it('uses the singular only for one day in English', () => {
    expect(dayCount({ days: 1, locale: 'en' })).toBe('1 day');
    expect(dayCount({ days: 15, locale: 'en' })).toBe('15 days');
  });
});
