import type { Plan } from '@gnomevpn/schemas';

import type { SubscriptionCharge } from './payment.types';

export type DescribeSubscriptionInput = {
  plan: Plan;
  kind: SubscriptionCharge;
};
