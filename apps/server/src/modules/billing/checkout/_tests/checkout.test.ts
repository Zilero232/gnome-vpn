import { PAYMENT_METHODS } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { YOOKASSA_METHODS } from '../checkout.constants';
import { localizedReturnUrl, offeredMethods } from '../checkout.helpers';

const BASE = 'https://gnomevpn.example/account';

describe('localizedReturnUrl', () => {
  it('keeps the unprefixed URL for the default locale', () => {
    expect(localizedReturnUrl({ baseUrl: BASE, locale: 'ru' })).toBe(BASE);
  });

  it('keeps the unprefixed URL when no locale was sent', () => {
    expect(localizedReturnUrl({ baseUrl: BASE, locale: undefined })).toBe(BASE);
  });

  it('prefixes the path with any other locale', () => {
    expect(localizedReturnUrl({ baseUrl: BASE, locale: 'en' })).toBe('https://gnomevpn.example/en/account');
  });

  it('prefixes the site root without a trailing slash', () => {
    expect(localizedReturnUrl({ baseUrl: 'https://gnomevpn.example/', locale: 'en' })).toBe('https://gnomevpn.example/en');
  });

  it('keeps the query string', () => {
    expect(localizedReturnUrl({ baseUrl: `${BASE}?paid=1`, locale: 'en' })).toBe('https://gnomevpn.example/en/account?paid=1');
  });

  it('does not prefix a URL that already carries the locale', () => {
    expect(localizedReturnUrl({ baseUrl: 'https://gnomevpn.example/en/account', locale: 'en' })).toBe('https://gnomevpn.example/en/account');
  });
});

describe('localizedReturnUrl, byte for byte', () => {
  it('hands the default locale the configured URL untouched, not re-serialised, so a reused payment still matches it', () => {
    expect(localizedReturnUrl({ baseUrl: 'https://gnomevpn.example', locale: 'ru' })).toBe('https://gnomevpn.example');
    expect(localizedReturnUrl({ baseUrl: 'HTTPS://GnomeVPN.example/account', locale: 'ru' })).toBe('HTTPS://GnomeVPN.example/account');
    expect(localizedReturnUrl({ baseUrl: 'https://gnomevpn.example/account', locale: undefined })).toBe('https://gnomevpn.example/account');
  });

  it('serialises the URL for any other locale', () => {
    expect(localizedReturnUrl({ baseUrl: 'https://gnomevpn.example', locale: 'en' })).toBe('https://gnomevpn.example/en');
    expect(localizedReturnUrl({ baseUrl: 'HTTPS://GnomeVPN.example/account', locale: 'en' })).toBe('https://gnomevpn.example/en/account');
    expect(localizedReturnUrl({ baseUrl: 'https://gnomevpn.example/en', locale: 'en' })).toBe('https://gnomevpn.example/en');
    expect(localizedReturnUrl({ baseUrl: 'https://gnomevpn.example/en/', locale: 'en' })).toBe('https://gnomevpn.example/en/');
  });
});

describe('offeredMethods', () => {
  it('names every method YooKassa reports that we have a name for', () => {
    expect(offeredMethods(Object.keys(YOOKASSA_METHODS))).toEqual(PAYMENT_METHODS);
  });

  it('keeps our display order whatever order YooKassa answers in, and drops methods we do not show', () => {
    expect(offeredMethods(['cash', 'sbp', 'mobile_balance', 'bank_card'])).toEqual(['card', 'sbp']);
  });

  it('reports nothing for a shop with nothing we can name, so the caller decides the fallback', () => {
    expect(offeredMethods([])).toEqual([]);
    expect(offeredMethods(['cash'])).toEqual([]);
  });
});
