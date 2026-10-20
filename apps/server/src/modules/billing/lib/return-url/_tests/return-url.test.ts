import { describe, expect, it } from 'vitest';

import { localizedReturnUrl } from '../return-url';

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
