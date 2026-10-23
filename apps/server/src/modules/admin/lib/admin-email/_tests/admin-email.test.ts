import { describe, expect, it } from 'vitest';

import { isAdmin } from '../admin-email';

const ADMINS = ['owner@example.com'];

describe('isAdmin', () => {
  it('lets in a listed address that has been confirmed', () => {
    expect(isAdmin({ email: ADMINS[0], emailVerified: true, admins: ADMINS })).toBe(true);
  });

  it('ignores the case of the account email', () => {
    expect(isAdmin({ email: ADMINS[0].toUpperCase(), emailVerified: true, admins: ADMINS })).toBe(true);
  });

  it('refuses a listed address nobody has confirmed', () => {
    expect(isAdmin({ email: ADMINS[0], emailVerified: false, admins: ADMINS })).toBe(false);
  });

  it('refuses an address that is not listed', () => {
    expect(isAdmin({ email: 'someone@example.com', emailVerified: true, admins: ADMINS })).toBe(false);
  });

  it('refuses everyone while the list is empty', () => {
    expect(isAdmin({ email: ADMINS[0], emailVerified: true, admins: [] })).toBe(false);
  });
});
