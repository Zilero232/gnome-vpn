import type { PlanId } from '@gnomevpn/schemas';

export type PlanPickerIntent = 'buy' | 'extend';

export type PlanPickerProps = {
  className?: string;
  defaultPlan?: PlanId;
  intent?: PlanPickerIntent;
};
