import type { Prisma } from '@/generated';

export const AUTO_RENEW = {
  windowHours: 24,
  manualHoldMinutes: 60
} as const;

export const DUE_SUBSCRIPTION_SELECT = {
  userId: true,
  savedCardId: true,
  plan: true,
  currentPeriodEnd: true,
  trialStartedAt: true
} as const satisfies Prisma.SubscriptionSelect;
