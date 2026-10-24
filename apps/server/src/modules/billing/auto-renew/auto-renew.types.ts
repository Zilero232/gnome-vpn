import type { Prisma } from '@/generated';

import type { DUE_SUBSCRIPTION_SELECT } from './auto-renew.constants';

export type DueSubscription = Prisma.SubscriptionGetPayload<{ select: typeof DUE_SUBSCRIPTION_SELECT }>;

export type ChargeAttemptInput = {
  userId: string;
  currentPeriodEnd: Date;
  paymentMethodId: string;
};

export type RenewalIdempotenceKeyInput = {
  userId: string;
  currentPeriodEnd: Date;
  paymentMethodId: string;
  amountRub: number;
};
