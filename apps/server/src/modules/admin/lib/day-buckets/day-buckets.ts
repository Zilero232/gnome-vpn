import type { AdminDay } from '@gnomevpn/schemas';

import type { AlignSeriesInput, BuildDaysInput } from './day-buckets.types';

export const alignSeries = ({ keys, rows }: AlignSeriesInput): number[] => {
  const byDay = new Map(rows.map((row) => [row.day, row.value]));

  return keys.map((key) => byDay.get(key) ?? 0);
};

export const buildDays = ({ keys, series }: BuildDaysInput): AdminDay[] => {
  const revenue = alignSeries({ keys, rows: series.revenue });
  const payments = alignSeries({ keys, rows: series.payments });
  const signups = alignSeries({ keys, rows: series.signups });
  const newPaid = alignSeries({ keys, rows: series.newPaid });
  const trials = alignSeries({ keys, rows: series.trials });

  return keys.map((date, index) => ({
    date,
    revenue: revenue[index],
    payments: payments[index],
    signups: signups[index],
    newPaid: newPaid[index],
    trials: trials[index]
  }));
};
