import type { LastPayment, SubscriptionStatus } from '@gnomevpn/schemas';

import { resolveLimits } from '@gnomevpn/schemas';
import { beforeEach, describe, expect, it } from 'vitest';

import { dismissInvitePrompt, invitePrompt, readDismissedInvitePrompt } from '../invite-prompt';
import { INVITE_PROMPT } from '../invite-prompt.constants';

const now = Date.parse('2026-10-20T12:00:00.000Z');

const payment: LastPayment = {
  status: 'succeeded',
  kind: 'subscription',
  isAutoCharge: false,
  createdAt: '2026-10-20T11:00:00.000Z'
};

const status: SubscriptionStatus = {
  status: 'active',
  plan: 'halfYearly',
  currentPeriodEnd: '2027-04-20T11:00:00.000Z',
  cancelAtPeriodEnd: false,
  hasPaymentMethod: true,
  savedCardTitle: null,
  isRecurringAvailable: true,
  period: 'paid',
  isTrialAvailable: false,
  limits: resolveLimits(0),
  lastPayment: payment
};

describe('invitePrompt', () => {
  it('offers the invite for the plan just bought, keyed by that payment', () => {
    expect(invitePrompt({ status, now })).toEqual({ key: payment.createdAt, plan: 'halfYearly' });
  });

  it('stays quiet without a status or a payment', () => {
    expect(invitePrompt({ status: null, now })).toBeNull();
    expect(invitePrompt({ status: { ...status, lastPayment: null }, now })).toBeNull();
  });

  it('waits for the payment to succeed', () => {
    expect(invitePrompt({ status: { ...status, lastPayment: { ...payment, status: 'pending' } }, now })).toBeNull();
    expect(invitePrompt({ status: { ...status, lastPayment: { ...payment, status: 'refunded' } }, now })).toBeNull();
  });

  it('ignores an automatic renewal, extra devices and a gift', () => {
    expect(invitePrompt({ status: { ...status, lastPayment: { ...payment, isAutoCharge: true } }, now })).toBeNull();
    expect(invitePrompt({ status: { ...status, lastPayment: { ...payment, kind: 'extraDevices' } }, now })).toBeNull();
    expect(invitePrompt({ status: { ...status, lastPayment: { ...payment, kind: 'gift' } }, now })).toBeNull();
  });

  it('needs a running paid period', () => {
    expect(invitePrompt({ status: { ...status, period: 'trial' }, now })).toBeNull();
    expect(invitePrompt({ status: { ...status, status: 'expired' }, now })).toBeNull();
  });

  it('goes away once the payment is no longer fresh', () => {
    const later = Date.parse(payment.createdAt) + INVITE_PROMPT.windowMs;

    expect(invitePrompt({ status, now: later - 1 })).not.toBeNull();
    expect(invitePrompt({ status, now: later })).toBeNull();
  });
});

describe('dismissed invite prompt', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('is nothing until the reader hides one', () => {
    expect(readDismissedInvitePrompt()).toBeNull();
  });

  it('remembers which payment the reader hid it for', () => {
    dismissInvitePrompt(payment.createdAt);

    expect(readDismissedInvitePrompt()).toBe(payment.createdAt);
  });
});
