import type { AdminDay } from '@gnomevpn/schemas';

export type DailyMetric = 'newPaid' | 'payments' | 'revenue' | 'signups' | 'trials';

export type DailyPointsInput = {
  days: AdminDay[];
  metric: DailyMetric;
  formatDay: (date: string) => string;
};

export type DailyPoint = {
  key: string;
  label: string;
  value: number;
};

export type DailySummaryInput = {
  days: AdminDay[];
  metric: DailyMetric;
};

export type DailyPeak = {
  date: string;
  value: number;
};

export type DailySummary = {
  total: number;
  peak: DailyPeak | null;
};
