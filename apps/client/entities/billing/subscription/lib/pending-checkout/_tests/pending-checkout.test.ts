import type { SubscriptionStatus } from '@gnomevpn/schemas';

import { resolveLimits } from '@gnomevpn/schemas';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearCheckoutPending,
  isCheckoutPending,
  markCheckoutPending,
  pendingOutcome,
  readPendingCheckout,
  statusFingerprint
} from '../pending-checkout';
import { PENDING_CHECKOUT } from '../pending-checkout.constants';

const now = 1_800_000_000_000;

const status: SubscriptionStatus = {
  status: 'active',
  plan: 'monthly',
  currentPeriodEnd: '2026-11-01T00:00:00.000Z',
  cancelAtPeriodEnd: true,
  hasPaymentMethod: false,
  savedCardTitle: null,
  isRecurringAvailable: true,
  period: 'paid',
  isTrialAvailable: false,
  limits: resolveLimits(0),
  lastPayment: null
};

describe('pending checkout', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('is not pending before anyone went to pay', () => {
    expect(isCheckoutPending(now)).toBe(false);
  });

  it('is pending right after the reader left for the payment page', () => {
    markCheckoutPending({ fingerprint: 'a', now });

    expect(isCheckoutPending(now + 1_000)).toBe(true);
    expect(readPendingCheckout(now + 1_000)).toEqual({ startedAt: now, fingerprint: 'a' });
  });

  it('stops being pending once the window has passed, so an abandoned payment does not poll forever', () => {
    markCheckoutPending({ fingerprint: 'a', now });

    expect(isCheckoutPending(now + PENDING_CHECKOUT.windowMs)).toBe(false);
  });

  it('stops being pending once the reader says the payment was cancelled', () => {
    markCheckoutPending({ fingerprint: 'a', now });
    clearCheckoutPending();

    expect(isCheckoutPending(now + 1_000)).toBe(false);
  });

  it('ignores a value written by an older build', () => {
    window.sessionStorage.setItem('gnomevpn.checkout-started-at', String(now));

    expect(isCheckoutPending(now + 1_000)).toBe(false);
  });
});

describe('statusFingerprint', () => {
  it('changes when a payment moves the period end', () => {
    expect(statusFingerprint({ ...status, currentPeriodEnd: '2026-12-01T00:00:00.000Z' })).not.toBe(statusFingerprint(status));
  });

  it('changes when extra devices are added', () => {
    expect(statusFingerprint({ ...status, limits: resolveLimits(1) })).not.toBe(statusFingerprint(status));
  });

  it('changes when a card is bound', () => {
    expect(statusFingerprint({ ...status, hasPaymentMethod: true })).not.toBe(statusFingerprint(status));
  });

  it('is empty without a status', () => {
    expect(statusFingerprint(null)).toBe('');
  });
});

describe('pendingOutcome', () => {
  const pending = { startedAt: now, fingerprint: statusFingerprint(status) };
  const checkout = { kind: 'subscription', isAutoCharge: false, createdAt: new Date(now - 2_000).toISOString() } as const;

  it('has nothing to say when no checkout was started', () => {
    expect(pendingOutcome({ pending: null, status })).toBe('none');
  });

  it('keeps waiting while nothing has changed', () => {
    expect(pendingOutcome({ pending, status: { ...status, lastPayment: { ...checkout, status: 'pending' } } })).toBe('pending');
  });

  it('settles when this checkout succeeded', () => {
    expect(pendingOutcome({ pending, status: { ...status, lastPayment: { ...checkout, status: 'succeeded' } } })).toBe('settled');
  });

  it('settles when the period moved, even before the payment row says so', () => {
    expect(pendingOutcome({ pending, status: { ...status, currentPeriodEnd: '2026-12-01T00:00:00.000Z' } })).toBe('settled');
  });

  it('reports a cancellation of this checkout', () => {
    expect(pendingOutcome({ pending, status: { ...status, lastPayment: { ...checkout, status: 'canceled' } } })).toBe('cancelled');
    expect(pendingOutcome({ pending, status: { ...status, lastPayment: { ...checkout, status: 'refunded' } } })).toBe('cancelled');
  });

  it('ignores a cancellation older than this checkout', () => {
    const old = { ...checkout, status: 'canceled', createdAt: new Date(now - 3_600_000).toISOString() } as const;

    expect(pendingOutcome({ pending, status: { ...status, lastPayment: old } })).toBe('pending');
  });

  it('ignores a declined automatic charge, which is not the checkout being waited on', () => {
    expect(pendingOutcome({ pending, status: { ...status, lastPayment: { ...checkout, isAutoCharge: true, status: 'canceled' } } })).toBe('pending');
  });
});
