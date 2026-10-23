import { describe, expect, it } from 'vitest';

import { paymentPlan } from '../payment-plan';

describe('paymentPlan', () => {
  it('hands back the plan a subscription or gift payment was bought for', () => {
    expect(paymentPlan({ kind: 'subscription', plan: 'yearly' })).toBe('yearly');
    expect(paymentPlan({ kind: 'gift', plan: 'monthly' })).toBe('monthly');
  });

  it('refuses a payment with no plan rather than guessing one, so a wrong row fails its transaction instead of granting a month', () => {
    expect(() => paymentPlan({ kind: 'extraDevices', plan: null })).toThrow('extraDevices');
  });
});
