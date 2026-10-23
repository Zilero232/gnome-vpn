import type { SubscriptionStatus } from '@gnomevpn/schemas';
import type { z } from 'zod';

import type { pendingCheckoutSchema } from './pending-checkout.schemas';

export type PendingCheckout = z.infer<typeof pendingCheckoutSchema>;

export type PendingOutcome = 'cancelled' | 'none' | 'pending' | 'settled';

export type MarkCheckoutPendingInput = {
  fingerprint: string;
  now?: number;
};

export type PendingOutcomeInput = {
  pending: PendingCheckout | null;
  status: SubscriptionStatus | null;
};
