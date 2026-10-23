import type { AdminPeriod } from '@gnomevpn/schemas';

export type PeriodStartInput = {
  period: AdminPeriod;
  now: Date;
};
