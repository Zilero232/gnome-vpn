import type { SubscriptionStatus } from '@gnomevpn/schemas';

export type PendingCheckout = {
  startedAt: number;
  fingerprint: string;
};

export type PendingOutcome = 'cancelled' | 'none' | 'pending' | 'settled';

export type MarkCheckoutPendingInput = {
  fingerprint: string;
  now?: number;
};

export type PendingOutcomeInput = {
  pending: PendingCheckout | null;
  status: SubscriptionStatus | null;
};
