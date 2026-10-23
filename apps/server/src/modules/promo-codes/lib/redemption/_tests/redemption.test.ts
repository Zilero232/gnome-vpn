import { addDays, subDays } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { promoEffect, redemptionRefusal, redemptionResult } from '../redemption';

const NOW = new Date('2026-10-23T12:00:00.000Z');
const OPEN = { expiresAt: null, maxUses: null };

describe('redemptionRefusal', () => {
  it('lets an open code through', () => {
    expect(redemptionRefusal({ promo: OPEN, uses: 1_000, isUsedByAccount: false, now: NOW })).toBeNull();
  });

  it('refuses a second redemption by the same account before anything else', () => {
    const spent = { expiresAt: subDays(NOW, 1), maxUses: 1 };

    expect(redemptionRefusal({ promo: spent, uses: 1, isUsedByAccount: true, now: NOW })).toBe('PROMO_CODE_ALREADY_USED');
  });

  it('refuses a code whose expiry has come', () => {
    expect(redemptionRefusal({ promo: { ...OPEN, expiresAt: NOW }, uses: 0, isUsedByAccount: false, now: NOW })).toBe('PROMO_CODE_EXPIRED');
    expect(redemptionRefusal({ promo: { ...OPEN, expiresAt: addDays(NOW, 1) }, uses: 0, isUsedByAccount: false, now: NOW })).toBeNull();
  });

  it('refuses the use past the limit and allows the last one', () => {
    const limited = { ...OPEN, maxUses: 3 };

    expect(redemptionRefusal({ promo: limited, uses: 2, isUsedByAccount: false, now: NOW })).toBeNull();
    expect(redemptionRefusal({ promo: limited, uses: 3, isUsedByAccount: false, now: NOW })).toBe('PROMO_CODE_USED_UP');
  });

  it('makes a single-use gift unusable once anyone has redeemed it', () => {
    const gift = { expiresAt: null, maxUses: 1 };

    expect(redemptionRefusal({ promo: gift, uses: 0, isUsedByAccount: false, now: NOW })).toBeNull();
    expect(redemptionRefusal({ promo: gift, uses: 1, isUsedByAccount: false, now: NOW })).toBe('PROMO_CODE_USED_UP');
  });
});

describe('promoEffect', () => {
  it('reads the effect each kind carries', () => {
    expect(promoEffect({ kind: 'discount', percent: 20, days: null })).toEqual({ kind: 'discount', percent: 20 });
    expect(promoEffect({ kind: 'days', percent: null, days: 30 })).toEqual({ kind: 'days', days: 30 });
    expect(promoEffect({ kind: 'gift', percent: null, days: 365 })).toEqual({ kind: 'gift', days: 365 });
  });

  it('refuses a row that lacks the value its kind needs', () => {
    expect(promoEffect({ kind: 'discount', percent: null, days: 30 })).toBeNull();
    expect(promoEffect({ kind: 'gift', percent: 20, days: null })).toBeNull();
  });
});

describe('redemptionResult', () => {
  it('reports a discount without touching the period', () => {
    expect(redemptionResult({ effect: { kind: 'discount', percent: 20 }, currentPeriodEnd: null })).toEqual({
      kind: 'discount',
      percent: 20,
      days: null,
      currentPeriodEnd: null
    });
  });

  it('reports the days and the new end of the period', () => {
    const end = addDays(NOW, 30);

    expect(redemptionResult({ effect: { kind: 'days', days: 30 }, currentPeriodEnd: end })).toEqual({
      kind: 'days',
      percent: null,
      days: 30,
      currentPeriodEnd: end.toISOString()
    });
  });
});
