import { describe, expect, it } from 'vitest';

import { AUTH_LOCALE } from '../auth.constants';
import { headerLocale, returnedUserId } from '../request-locale';

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
