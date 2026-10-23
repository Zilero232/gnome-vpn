import type { PlanId } from '@gnomevpn/schemas';

export type PaymentPlanInput = {
  kind: string;
  plan: PlanId | null;
};
