import type { LastPayment, SubscriptionStatus } from '@gnomevpn/schemas';

import { resolveLimits } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { hasAutoChargeFailed } from '../charge-failed';

const payment: LastPayment = { status: 'canceled', kind: 'subscription', isAutoCharge: true, createdAt: '2026-10-20T10:00:00.000Z' };

const status: SubscriptionStatus = {
  status: 'active',
  plan: 'monthly',
  currentPeriodEnd: '2026-10-21T00:00:00.000Z',
  cancelAtPeriodEnd: false,
  hasPaymentMethod: true,
  savedCardTitle: 'Visa 4242',
  isRecurringAvailable: true,
  period: 'paid',
  isTrialAvailable: false,
  limits: resolveLimits(0),
  lastPayment: payment
};

describe('hasAutoChargeFailed', () => {
  it('is true when the last automatic renewal was declined', () => {
    expect(hasAutoChargeFailed(status)).toBe(true);
  });

  it('is false for a checkout the reader abandoned by hand', () => {
    expect(hasAutoChargeFailed({ ...status, lastPayment: { ...payment, isAutoCharge: false } })).toBe(false);
  });

  it('is false once a later payment went through', () => {
    expect(hasAutoChargeFailed({ ...status, lastPayment: { ...payment, status: 'succeeded' } })).toBe(false);
  });

  it('is false with no payment at all', () => {
    expect(hasAutoChargeFailed({ ...status, lastPayment: null })).toBe(false);
  });
});
