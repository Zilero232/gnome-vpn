import type { PlanId } from '@gnomevpn/schemas';

import { isNullish } from 'remeda';

import type { PaymentPlanInput } from './payment-plan.types';

export const paymentPlan = ({ kind, plan }: PaymentPlanInput): PlanId => {
  if (isNullish(plan)) {
    throw new Error(`a ${kind} payment carries no plan`);
  }

  return plan;
};
