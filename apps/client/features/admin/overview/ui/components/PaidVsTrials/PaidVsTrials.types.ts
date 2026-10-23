import type { AdminDay } from '@gnomevpn/schemas';

export type PaidVsTrialsProps = {
  days: AdminDay[];
  period: number;
  isFaded: boolean;
};
