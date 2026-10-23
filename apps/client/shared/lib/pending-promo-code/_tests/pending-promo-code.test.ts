import { afterEach, describe, expect, it } from 'vitest';

import { REFERRAL_COOKIE } from '@/shared/constants';

import { clearPendingPromoCode, readPendingPromoCode, storePendingPromoCode, syncPendingPromoCode } from '../pending-promo-code';

describe('pending promo code', () => {
  afterEach(() => clearPendingPromoCode());

  it('reads back the code it stored, normalised the way the server expects it', () => {
    storePendingPromoCode('abcd2345');

    expect(readPendingPromoCode()).toBe('ABCD2345');
  });

  it('keeps any kind of promo code, not only a friend code', () => {
    storePendingPromoCode('blogger20');

    expect(readPendingPromoCode()).toBe('BLOGGER20');

    storePendingPromoCode('abcd-efgh-jkmn');

    expect(readPendingPromoCode()).toBe('ABCDEFGHJKMN');
  });

  it('lets a typed code replace the one a link stored earlier', () => {
    storePendingPromoCode('ABCD2345');
    storePendingPromoCode('WXYZ6789');

    expect(readPendingPromoCode()).toBe('WXYZ6789');
  });

  it('forgets the code once cleared', () => {
    storePendingPromoCode('ABCD2345');
    clearPendingPromoCode();

    expect(readPendingPromoCode()).toBeNull();
  });

  it('ignores a stored value that is not a code at all', () => {
    document.cookie = `${REFERRAL_COOKIE.name}=not_a_code; path=${REFERRAL_COOKIE.path}`;

    expect(readPendingPromoCode()).toBeNull();
  });

  it('mirrors a typed code, so any way of signing in claims what the field shows', () => {
    syncPendingPromoCode(' abcd 2345 ');

    expect(readPendingPromoCode()).toBe('ABCD2345');
  });

  it('drops the link code once the field is erased or no longer holds a code', () => {
    storePendingPromoCode('ABCD2345');
    syncPendingPromoCode('');

    expect(readPendingPromoCode()).toBeNull();

    storePendingPromoCode('ABCD2345');
    syncPendingPromoCode('AB');

    expect(readPendingPromoCode()).toBeNull();
  });
});
