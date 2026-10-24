import { describe, expect, it } from 'vitest';

import { periodStart } from '@/modules/admin/lib/period-start';

import { paymentWhere } from '../payment-filter';

const NOW = new Date('2026-10-23T12:00:00.000Z');

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
