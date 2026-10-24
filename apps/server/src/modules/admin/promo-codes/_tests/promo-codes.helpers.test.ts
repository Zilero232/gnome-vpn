import { addDays, addSeconds, subMinutes } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { campaignExpiry, campaignState, giftStateWhere } from '../promo-codes.helpers';

const NOW = new Date('2026-10-23T12:00:00.000Z');

const MOSCOW_OFFSET_HOURS = 3;

describe('campaignState', () => {
  it('is active with no expiry and no limit', () => {
    expect(campaignState({ expiresAt: null, maxUses: null, used: 1000, now: NOW })).toBe('active');
  });

  it('is expired from the moment of its expiry, which is how a stopped code reads', () => {
    expect(campaignState({ expiresAt: NOW, maxUses: null, used: 0, now: NOW })).toBe('expired');
    expect(campaignState({ expiresAt: subMinutes(NOW, 1), maxUses: null, used: 0, now: NOW })).toBe('expired');
  });

  it('is used up once the redemptions reach the limit', () => {
    const maxUses = 10;

    expect(campaignState({ expiresAt: null, maxUses, used: maxUses - 1, now: NOW })).toBe('active');
    expect(campaignState({ expiresAt: null, maxUses, used: maxUses, now: NOW })).toBe('usedUp');
  });

  it('reports the expiry first when a code is both expired and used up', () => {
    expect(campaignState({ expiresAt: subMinutes(NOW, 1), maxUses: 1, used: 1, now: NOW })).toBe('expired');
  });

  it('stays active before a future expiry', () => {
    expect(campaignState({ expiresAt: addDays(NOW, 1), maxUses: null, used: 0, now: NOW })).toBe('active');
  });
});

describe('campaignExpiry', () => {
  it('keeps the code working through the whole last day in Moscow', () => {
    const expiry = campaignExpiry('2026-12-31');
    const nextMoscowMidnight = new Date(Date.UTC(2027, 0, 1, -MOSCOW_OFFSET_HOURS));

    expect(expiry && addSeconds(expiry, 1).getTime()).toBe(nextMoscowMidnight.getTime());
  });

  it('has no expiry when no day is given', () => {
    expect(campaignExpiry(null)).toBeNull();
  });
});

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
