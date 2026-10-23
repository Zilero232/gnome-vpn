import type { AdminDay } from '@gnomevpn/schemas';

import type { DailyMetric } from '../../../lib';

export type DailyChartMetric = Extract<DailyMetric, 'payments' | 'revenue' | 'signups'>;

export type DailyChartProps = {
  days: AdminDay[];
  metric: DailyChartMetric;
  period: number;
  isFaded: boolean;
  formatValue: (value: number) => string;
  formatTick: (value: number) => string;
};
