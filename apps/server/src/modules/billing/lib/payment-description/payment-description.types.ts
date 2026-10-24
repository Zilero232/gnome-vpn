import type { Plan } from '@gnomevpn/schemas';

import type { SUBSCRIPTION_PREFIX } from '@/modules/billing/config';

export type SubscriptionKind = keyof typeof SUBSCRIPTION_PREFIX;

export type DescribeSubscriptionInput = {
  plan: Plan;
  kind: SubscriptionKind;
};
