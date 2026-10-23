import { describe, expect, it } from 'vitest';

import type { CheckoutRow } from '../abandoned-checkout.types';

import { CHECKOUT_REMINDER } from '../../../../../config';
import { abandonedCheckouts, checkoutNotice } from '../abandoned-checkout';

const row = (overrides: Partial<CheckoutRow> = {}): CheckoutRow => ({
  id: 'payment-1',
  userId: 'user-1',
  kind: 'subscription',
  createdAt: new Date('2026-10-23T10:00:00.000Z'),
  ...overrides
});

describe('checkoutNotice', () => {
  it('reminds of a subscription and of a gift, each in its own words', () => {
    expect(checkoutNotice('subscription')).toBe(CHECKOUT_REMINDER.notice.subscription);
    expect(checkoutNotice('gift')).toBe(CHECKOUT_REMINDER.notice.gift);
  });

  it('leaves extra places alone', () => {
    expect(checkoutNotice('extraDevices')).toBeNull();
  });
});

describe('abandonedCheckouts', () => {
  it('keeps only the newest checkout of each account, whatever order they came in', () => {
    const older = row({ id: 'older', createdAt: new Date('2026-10-23T09:00:00.000Z') });
    const newer = row({ id: 'newer', kind: 'gift' });
    const other = row({ id: 'other', userId: 'user-2' });

    expect(
      abandonedCheckouts([older, other, newer])
        .map((checkout) => checkout.id)
        .sort()
    ).toEqual(['newer', 'other']);
  });

  it('carries the notice that matches the kind', () => {
    expect(abandonedCheckouts([row({ kind: 'gift' })])).toEqual([
      { id: 'payment-1', userId: 'user-1', createdAt: new Date('2026-10-23T10:00:00.000Z'), notice: CHECKOUT_REMINDER.notice.gift }
    ]);
  });

  it('drops a payment whose account is gone, and one with nothing to remind of', () => {
    expect(abandonedCheckouts([row({ userId: null }), row({ id: 'places', userId: 'user-2', kind: 'extraDevices' })])).toEqual([]);
  });
});
