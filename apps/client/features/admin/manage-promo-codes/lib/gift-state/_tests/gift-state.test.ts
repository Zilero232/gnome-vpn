import { describe, expect, it } from 'vitest';

import { giftState } from '../gift-state';

const REDEEMED_AT = '2026-10-20T09:00:00.000Z';

describe('giftState', () => {
  it('waits for a recipient until someone redeems the code', () => {
    expect(giftState({ isRevoked: false, redeemedAt: null })).toBe('waiting');
    expect(giftState({ isRevoked: false, redeemedAt: REDEEMED_AT })).toBe('redeemed');
  });

  it('calls a refunded gift revoked even after it was redeemed', () => {
    expect(giftState({ isRevoked: true, redeemedAt: REDEEMED_AT })).toBe('revoked');
    expect(giftState({ isRevoked: true, redeemedAt: null })).toBe('revoked');
  });
});
