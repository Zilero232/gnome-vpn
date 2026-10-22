import { afterEach, describe, expect, it } from 'vitest';

import { REFERRAL_COOKIE } from '@/shared/constants';

import { clearPendingReferral, readPendingReferral, storePendingReferral, syncPendingReferral } from '../pending-referral';

describe('pending referral', () => {
  afterEach(() => clearPendingReferral());

  it('reads back the code it stored, normalised the way the server expects it', () => {
    storePendingReferral('abcd2345');

    expect(readPendingReferral()).toBe('ABCD2345');
  });

  it('lets a typed code replace the one a link stored earlier', () => {
    storePendingReferral('ABCD2345');
    storePendingReferral('WXYZ6789');

    expect(readPendingReferral()).toBe('WXYZ6789');
  });

  it('forgets the code once cleared', () => {
    storePendingReferral('ABCD2345');
    clearPendingReferral();

    expect(readPendingReferral()).toBeNull();
  });

  it('ignores a stored value that is not a code at all', () => {
    document.cookie = `${REFERRAL_COOKIE.name}=not-a-code; path=${REFERRAL_COOKIE.path}`;

    expect(readPendingReferral()).toBeNull();
  });

  it('mirrors a typed code, so any way of signing in claims what the field shows', () => {
    syncPendingReferral(' abcd 2345 ');

    expect(readPendingReferral()).toBe('ABCD2345');
  });

  it('drops the link code once the field is erased or no longer holds a code', () => {
    storePendingReferral('ABCD2345');
    syncPendingReferral('');

    expect(readPendingReferral()).toBeNull();

    storePendingReferral('ABCD2345');
    syncPendingReferral('ABCD');

    expect(readPendingReferral()).toBeNull();
  });
});
