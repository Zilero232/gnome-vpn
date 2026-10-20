import type { SubscriptionStatus } from '@gnomevpn/schemas';

import { STORAGE_KEYS } from '@/shared/constants';
import { isServer } from '@/shared/lib';

import type { MarkCheckoutPendingInput, PendingCheckout, PendingOutcome, PendingOutcomeInput } from './pending-checkout.types';

import { PENDING_CHECKOUT } from './pending-checkout.constants';

const parse = (raw: string | null): PendingCheckout | null => {
  if (!raw) {
    return null;
  }

  try {
    const value: unknown = JSON.parse(raw);

    if (typeof value === 'object' && value !== null && 'startedAt' in value && 'fingerprint' in value) {
      const { startedAt, fingerprint } = value;

      return typeof startedAt === 'number' && typeof fingerprint === 'string' ? { startedAt, fingerprint } : null;
    }
  } catch {}

  return null;
};

export const statusFingerprint = (status: SubscriptionStatus | null | undefined): string =>
  status
    ? [status.currentPeriodEnd ?? '', status.limits.extraDevices, status.hasPaymentMethod, status.cancelAtPeriodEnd, status.period].join('|')
    : '';

export const markCheckoutPending = ({ fingerprint, now = Date.now() }: MarkCheckoutPendingInput): void => {
  if (isServer()) {
    return;
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEYS.checkoutStartedAt, JSON.stringify({ startedAt: now, fingerprint }));
  } catch {}
};

export const clearCheckoutPending = (): void => {
  if (isServer()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(STORAGE_KEYS.checkoutStartedAt);
  } catch {}
};

export const readPendingCheckout = (now = Date.now()): PendingCheckout | null => {
  if (isServer()) {
    return null;
  }

  try {
    const pending = parse(window.sessionStorage.getItem(STORAGE_KEYS.checkoutStartedAt));

    return pending && now - pending.startedAt < PENDING_CHECKOUT.windowMs ? pending : null;
  } catch {
    return null;
  }
};

export const isCheckoutPending = (now = Date.now()): boolean => readPendingCheckout(now) !== null;

export const pendingOutcome = ({ pending, status }: PendingOutcomeInput): PendingOutcome => {
  if (!pending) {
    return 'none';
  }

  if (!status) {
    return 'pending';
  }

  const payment = status.lastPayment;
  const isThisCheckout =
    payment !== null && !payment.isAutoCharge && Date.parse(payment.createdAt) >= pending.startedAt - PENDING_CHECKOUT.clockSlackMs;

  if (isThisCheckout && (payment.status === 'canceled' || payment.status === 'refunded')) {
    return 'cancelled';
  }

  if (isThisCheckout && payment.status === 'succeeded') {
    return 'settled';
  }

  const fingerprint = statusFingerprint(status);

  return pending.fingerprint !== '' && pending.fingerprint !== fingerprint ? 'settled' : 'pending';
};
