import { describe, expect, it } from 'vitest';

import { giftStateWhere } from '../gift-filter';

const NOW = new Date('2026-10-23T12:00:00.000Z');

describe('giftStateWhere', () => {
  it('filters nothing without a state', () => {
    expect(giftStateWhere({ state: undefined, now: NOW })).toEqual({});
  });

  it('calls a gift revoked once a refund moved its expiry into the past', () => {
    expect(giftStateWhere({ state: 'revoked', now: NOW })).toEqual({ expiresAt: { lte: NOW } });
  });

  it('splits live gifts by whether anyone redeemed them', () => {
    expect(JSON.stringify(giftStateWhere({ state: 'redeemed', now: NOW }))).toContain('"some"');
    expect(JSON.stringify(giftStateWhere({ state: 'waiting', now: NOW }))).toContain('"none"');

    for (const state of ['redeemed', 'waiting'] as const) {
      expect(JSON.stringify(giftStateWhere({ state, now: NOW }))).toContain('"expiresAt":null');
    }
  });
});
