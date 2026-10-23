import { describe, expect, it } from 'vitest';

import type { PaymentStatusGroup } from '../payment-totals.types';

import { Prisma } from '../../../../../../generated';
import { paymentTotals } from '../payment-totals';

const group = (status: PaymentStatusGroup['status'], count: number, amount: string): PaymentStatusGroup => ({
  status,
  _count: { _all: count },
  _sum: { amount: new Prisma.Decimal(amount) }
});

const GROUPS = [group('succeeded', 3, '2970.00'), group('refunded', 1, '990.00'), group('canceled', 2, '400.00'), group('pending', 1, '200.00')];

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
