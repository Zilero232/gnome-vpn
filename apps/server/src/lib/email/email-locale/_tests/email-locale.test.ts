import { describe, expect, it } from 'vitest';

import { acceptedLocale, isEmailLocale, localizedPath, pickEmailLocale } from '../email-locale';
import { EMAIL_LOCALE } from '../email-locale.constants';

const [, other] = EMAIL_LOCALE.all;

describe('pickEmailLocale', () => {
  it('takes the first candidate that is a locale the emails speak', () => {
    expect(pickEmailLocale([null, 'de', other, EMAIL_LOCALE.fallback])).toBe(other);
  });

  it('falls back when nothing is known', () => {
    expect(pickEmailLocale([undefined, null, 'de'])).toBe(EMAIL_LOCALE.fallback);
  });
});

describe('isEmailLocale', () => {
  it('refuses anything that is not a supported locale', () => {
    expect(isEmailLocale('__proto__')).toBe(false);
    expect(isEmailLocale(1)).toBe(false);
  });
});

describe('acceptedLocale', () => {
  it('reads the primary language of the first preference', () => {
    expect(acceptedLocale('en-GB,en;q=0.9,ru;q=0.8')).toBe('en');
    expect(acceptedLocale('ru-RU')).toBe('ru');
  });

  it('answers null for a language the emails do not speak or no header', () => {
    expect(acceptedLocale('de-DE,de;q=0.9')).toBeNull();
    expect(acceptedLocale(null)).toBeNull();
  });
});

describe('localizedPath', () => {
  it('leaves the default locale unprefixed, as the site routes it', () => {
    expect(localizedPath({ path: '/account', locale: EMAIL_LOCALE.fallback })).toBe('/account');
  });

  it('prefixes any other locale', () => {
    expect(localizedPath({ path: '/account', locale: other })).toBe(`/${other}/account`);
    expect(localizedPath({ path: '/', locale: other })).toBe(`/${other}`);
  });
});
