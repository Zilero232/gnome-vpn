import { describe, expect, it } from 'vitest';

import { isAdmin } from '../access.helpers';

const ADMIN = 'owner@example.com';
const ADMINS = [ADMIN];

describe('isAdmin', () => {
  it('lets in a listed address that has been confirmed', () => {
    expect(isAdmin({ email: ADMIN, emailVerified: true, admins: ADMINS })).toBe(true);
  });

  it('ignores the case of the account email', () => {
    expect(isAdmin({ email: ADMIN.toUpperCase(), emailVerified: true, admins: ADMINS })).toBe(true);
  });

  it('refuses a listed address nobody has confirmed', () => {
    expect(isAdmin({ email: ADMIN, emailVerified: false, admins: ADMINS })).toBe(false);
  });

  it('refuses an address that is not listed', () => {
    expect(isAdmin({ email: 'someone@example.com', emailVerified: true, admins: ADMINS })).toBe(false);
  });

  it('refuses everyone while the list is empty', () => {
    expect(isAdmin({ email: ADMIN, emailVerified: true, admins: [] })).toBe(false);
  });
});
