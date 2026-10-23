import { paymentStatusSchema } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { isRefundable, paymentState } from '../payment-state';

const REQUESTED = '2026-10-23T10:00:00.000Z';

describe('paymentState', () => {
  it('shows a succeeded payment with a refund on its way as refund-requested until the webhook lands', () => {
    expect(paymentState({ status: 'succeeded', refundRequestedAt: REQUESTED })).toBe('refundRequested');
  });

  it('lets the settled status win once the webhook has moved the row', () => {
    expect(paymentState({ status: 'refunded', refundRequestedAt: REQUESTED })).toBe('refunded');
  });

  it('keeps every status as it is when no refund was asked for', () => {
    for (const status of paymentStatusSchema.options) {
      expect(paymentState({ status, refundRequestedAt: null })).toBe(status);
    }
  });
});

describe('isRefundable', () => {
  it('offers a refund only for a succeeded payment nobody has asked to refund yet', () => {
    const refundable = paymentStatusSchema.options.filter((status) => isRefundable({ status, refundRequestedAt: null }));

    expect(refundable).toEqual(['succeeded']);
    expect(isRefundable({ status: 'succeeded', refundRequestedAt: REQUESTED })).toBe(false);
  });
});
