import { describe, expect, it } from 'vitest';

import { Prisma } from '@/generated';

import type { PaymentStatusGroup } from '../payments.types';

import { periodStart } from '../../shared/listing.helpers';
import { paymentTotals, paymentWhere } from '../payments.helpers';

const NOW = new Date('2026-10-23T12:00:00.000Z');

const group = (status: PaymentStatusGroup['status'], count: number, amount: string): PaymentStatusGroup => ({
  status,
  _count: { _all: count },
  _sum: { amount: new Prisma.Decimal(amount) }
});

const GROUPS = [group('succeeded', 3, '2970.00'), group('refunded', 1, '990.00'), group('canceled', 2, '400.00'), group('pending', 1, '200.00')];

describe('paymentWhere', () => {
  it('filters nothing for every payment of all time', () => {
    expect(paymentWhere({ filter: { period: 'all' }, now: NOW })).toEqual({});
  });

  it('applies only the filters that were chosen', () => {
    const where = paymentWhere({ filter: { period: 'all', status: 'refunded' }, now: NOW });

    expect(where).toEqual({ status: 'refunded' });
  });

  it('bounds the creation date by the period start', () => {
    const where = paymentWhere({ filter: { period: '30d', kind: 'gift', plan: 'yearly' }, now: NOW });

    expect(where).toEqual({ kind: 'gift', plan: 'yearly', createdAt: { gte: periodStart({ period: '30d', now: NOW }) } });
  });
});

describe('paymentTotals', () => {
  it('counts every payment under the filter', () => {
    expect(paymentTotals(GROUPS).count).toBe(7);
  });

  it('keeps money that never arrived out of what was paid', () => {
    const totals = paymentTotals(GROUPS);

    expect(totals.paid).toBe(2970);
    expect(totals.refunded).toBe(990);
  });

  it('reads an empty filter as nothing paid', () => {
    expect(paymentTotals([])).toEqual({ count: 0, paid: 0, refunded: 0 });
  });
});
