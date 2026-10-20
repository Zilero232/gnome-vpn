import type { SubscriptionStatus } from '@gnomevpn/schemas';

import { resolveLimits } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { isAutoRenewActive } from '../auto-renew';

const status: SubscriptionStatus = {
  status: 'active',
  plan: 'monthly',
  currentPeriodEnd: '2026-11-01T00:00:00.000Z',
  cancelAtPeriodEnd: false,
  hasPaymentMethod: true,
  savedCardTitle: 'Visa 4242',
  isRecurringAvailable: true,
  period: 'paid',
  isTrialAvailable: false,
  limits: resolveLimits(0),
  lastPayment: null
};

describe('isAutoRenewActive', () => {
  it('is on with a saved card, renewal wanted and the shop able to charge', () => {
    expect(isAutoRenewActive(status)).toBe(true);
  });

  it('is off once the reader turned renewal off', () => {
    expect(isAutoRenewActive({ ...status, cancelAtPeriodEnd: true })).toBe(false);
  });

  it('is off without a card, whatever the stored preference says', () => {
    expect(isAutoRenewActive({ ...status, hasPaymentMethod: false })).toBe(false);
  });

  it('is off while the shop cannot charge recurrently', () => {
    expect(isAutoRenewActive({ ...status, isRecurringAvailable: false })).toBe(false);
  });
});
