import type { SubscriptionStatus } from '@gnomevpn/schemas';

export const hasAutoChargeFailed = ({ lastPayment }: SubscriptionStatus): boolean =>
  lastPayment !== null && lastPayment.isAutoCharge && lastPayment.kind === 'subscription' && lastPayment.status === 'canceled';
