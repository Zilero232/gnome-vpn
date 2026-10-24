import { keys } from 'remeda';
import { describe, expect, it } from 'vitest';

import { EMAIL_LOCALE } from '../../email-locale/email-locale.constants';
import { EMAIL_TEXT, fillEmail, isEmailNotice } from '../email-text';

const shapeOf = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return 'list';
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, shapeOf(inner)]));
  }

  return typeof value;
};

describe('email copy', () => {
  it('has the same keys in every language, so no email falls back to a missing string', () => {
    const [first, ...rest] = EMAIL_LOCALE.all.map((locale) => shapeOf(EMAIL_TEXT[locale]));

    for (const each of rest) {
      expect(each).toEqual(first);
    }
  });

  it('gives every notice the same paragraph count in every language', () => {
    for (const notice of keys(EMAIL_TEXT.ru.notices)) {
      const counts = EMAIL_LOCALE.all.map((locale) => EMAIL_TEXT[locale].notices[notice].body.length);

      expect(new Set(counts).size, notice).toBe(1);
    }
  });
});

describe('isEmailNotice', () => {
  it('knows the notices that have an email', () => {
    for (const notice of keys(EMAIL_TEXT.ru.notices)) {
      expect(isEmailNotice(notice)).toBe(true);
    }
  });

  it('refuses a notice with no email copy', () => {
    expect(isEmailNotice('deviceAdded')).toBe(false);
  });
});

describe('fillEmail', () => {
  it('replaces every occurrence of a token and leaves the rest', () => {
    expect(fillEmail({ text: '{date} and {date}, {amount}', fill: { date: 'x' } })).toBe('x and x, {amount}');
  });

  it('inserts a value literally even when it holds a replacement pattern', () => {
    expect(fillEmail({ text: 'Code: {code}', fill: { code: 'a$&b' } })).toBe('Code: a$&b');
  });
});
