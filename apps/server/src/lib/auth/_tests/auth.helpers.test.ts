import { describe, expect, it } from 'vitest';

import { env } from '@/config';

import { AUTH_LOCALE, AUTH_PATHS } from '../auth.constants';
import { claimedEmail, headerLocale, returnedUserId, withClientCallback } from '../auth.helpers';

describe('claimedEmail', () => {
  it('reads the address a sign-up claims', () => {
    expect(claimedEmail({ path: '/sign-up/email', body: { email: 'a@b.c', password: 'x' } })).toBe('a@b.c');
  });

  it('reads the new address of an email change', () => {
    expect(claimedEmail({ path: '/change-email', body: { newEmail: 'n@b.c' } })).toBe('n@b.c');
  });

  it('ignores routes that claim no address', () => {
    expect(claimedEmail({ path: '/sign-in/email', body: { email: 'a@b.c' } })).toBeNull();
  });

  it('ignores a body whose field is not a string', () => {
    expect(claimedEmail({ path: '/sign-up/email', body: { email: { not: '' } } })).toBeNull();
  });

  it('does not treat an inherited key as a guarded path', () => {
    expect(claimedEmail({ path: 'toString', body: { email: 'a@b.c' } })).toBeNull();
  });
});

describe('headerLocale', () => {
  it('reads the locale the site sends', () => {
    expect(headerLocale(new Headers({ [AUTH_LOCALE.header]: 'EN' }))).toBe('en');
  });

  it('answers null for a locale the site does not have or no header at all', () => {
    expect(headerLocale(new Headers({ [AUTH_LOCALE.header]: 'de' }))).toBeNull();
    expect(headerLocale(new Headers())).toBeNull();
    expect(headerLocale(null)).toBeNull();
  });
});

describe('returnedUserId', () => {
  it('reads the user id out of a session or sign-in answer', () => {
    expect(returnedUserId({ session: {}, user: { id: 'u1' } })).toBe('u1');
    expect(returnedUserId({ token: 't', user: { id: 'u2' } })).toBe('u2');
  });

  it('answers null for anything else', () => {
    expect(returnedUserId(null)).toBeNull();
    expect(returnedUserId({ user: null })).toBeNull();
    expect(returnedUserId({ user: { id: 1 } })).toBeNull();
    expect(returnedUserId(new Response())).toBeNull();
  });
});

describe('withClientCallback', () => {
  const VERIFY_URL = 'http://localhost:4000/auth/verify-email?token=t';

  it('sends the click back to the localized page on the site', () => {
    const url = new URL(withClientCallback({ url: VERIFY_URL, locale: 'en', path: AUTH_PATHS.account }));

    expect(url.searchParams.get('token')).toBe('t');
    expect(url.searchParams.get('callbackURL')).toBe(new URL(`/en${AUTH_PATHS.account}`, env.CLIENT_URL).toString());
  });

  it('hands back a link it cannot read untouched', () => {
    expect(withClientCallback({ url: 'not a url', locale: 'en' })).toBe('not a url');
  });
});
