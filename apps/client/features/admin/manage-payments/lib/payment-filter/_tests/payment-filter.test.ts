import { adminPaymentFilterSchema } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import type { PaymentFilterState } from '../payment-filter.types';

import { PAYMENT_FILTER } from '../../../config';
import { paymentFilterQuery } from '../payment-filter';

describe('paymentFilterQuery', () => {
  it('sends nothing for a filter left on «any», so the server never sees an empty value', () => {
    const query = paymentFilterQuery(PAYMENT_FILTER.initial);

    expect(Object.keys(query)).toEqual(['period']);
    expect(adminPaymentFilterSchema.safeParse(query).success).toBe(true);
  });

  it('passes every chosen value through unchanged', () => {
    const state: PaymentFilterState = { status: 'refunded', kind: 'gift', plan: 'yearly', period: 'all' };

    expect(paymentFilterQuery(state)).toEqual(state);
    expect(adminPaymentFilterSchema.parse(paymentFilterQuery(state))).toEqual(state);
  });
});
