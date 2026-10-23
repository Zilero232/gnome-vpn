import type { AdminPeriod, PaymentKind, PaymentStatus, PlanId } from '@gnomevpn/schemas';

export type PaymentFilter = {
  status?: PaymentStatus;
  kind?: PaymentKind;
  plan?: PlanId;
  period: AdminPeriod;
};

export type PaymentWhereInput = {
  filter: PaymentFilter;
  now: Date;
};
