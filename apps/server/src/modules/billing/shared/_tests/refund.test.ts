import { addHours, subHours } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { PERIOD_GRACE } from '@/common/lib';
import { Prisma } from '@/generated';

import { isPartialRefund, refundIdempotenceKey, refundReason } from '../refund.helpers';

const NOW = new Date('2026-03-10T12:00:00.000Z');
const DEVICES = { kind: 'extraDevices', quantity: 2 } as const;

describe('refundReason', () => {
  it('refunds any payment whose account is gone', () => {
    expect(refundReason({ userId: null, purchase: { kind: 'subscription', planId: 'monthly' }, currentPeriodEnd: null, now: NOW })).toBe('orphan');
    expect(refundReason({ userId: null, purchase: DEVICES, currentPeriodEnd: addHours(NOW, 1), now: NOW })).toBe('orphan');
  });

  it('honours a subscription or a gift whatever the period', () => {
    expect(refundReason({ userId: 'u', purchase: { kind: 'subscription', planId: 'monthly' }, currentPeriodEnd: null, now: NOW })).toBeNull();
    expect(refundReason({ userId: 'u', purchase: { kind: 'gift', planId: 'yearly' }, currentPeriodEnd: null, now: NOW })).toBeNull();
  });

  it('refunds extra places once the period lapsed beyond the grace, and honours them within it', () => {
    expect(refundReason({ userId: 'u', purchase: DEVICES, currentPeriodEnd: subHours(NOW, PERIOD_GRACE.hours), now: NOW })).toBe('lapsed');
    expect(refundReason({ userId: 'u', purchase: DEVICES, currentPeriodEnd: null, now: NOW })).toBe('lapsed');
    expect(refundReason({ userId: 'u', purchase: DEVICES, currentPeriodEnd: subHours(NOW, PERIOD_GRACE.hours - 1), now: NOW })).toBeNull();
  });
});

describe('isPartialRefund', () => {
  it('calls a refund of the whole amount full', () => {
    expect(isPartialRefund({ refundedRub: 199, amount: new Prisma.Decimal('199.00') })).toBe(false);
    expect(isPartialRefund({ refundedRub: 1490.5, amount: new Prisma.Decimal('1490.50') })).toBe(false);
  });

  it('calls a refund short by a kopeck partial', () => {
    expect(isPartialRefund({ refundedRub: 198.99, amount: new Prisma.Decimal('199.00') })).toBe(true);
  });
});

describe('refundIdempotenceKey, byte for byte', () => {
  it('stays refund-<payment row id>, so the sweep retrying a payment asks YooKassa for the same refund', () => {
    expect(refundIdempotenceKey('0b5c2f7e-1d1a-4c39-9a51-7d0e0c1e2f3a')).toBe('refund-0b5c2f7e-1d1a-4c39-9a51-7d0e0c1e2f3a');
  });
});
