import type { AdminPeriod, PaymentKind, PaymentStatus, PlanId } from '@gnomevpn/schemas';

export type PaymentFilterState = {
  status: '' | PaymentStatus;
  kind: '' | PaymentKind;
  plan: '' | PlanId;
  period: AdminPeriod;
};
