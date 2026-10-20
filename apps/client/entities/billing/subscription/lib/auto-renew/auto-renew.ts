import type { SubscriptionStatus } from '@gnomevpn/schemas';

export const isAutoRenewActive = ({ isRecurringAvailable, hasPaymentMethod, cancelAtPeriodEnd }: SubscriptionStatus): boolean =>
  isRecurringAvailable && hasPaymentMethod && !cancelAtPeriodEnd;
