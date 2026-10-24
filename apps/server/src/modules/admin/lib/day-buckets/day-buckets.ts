import type { AdminDay } from '@gnomevpn/schemas';

import { mapValues } from 'remeda';

import type { BuildDaysInput } from './day-buckets.types';

export const buildDays = ({ keys, series }: BuildDaysInput): AdminDay[] => {
  const byDay = mapValues(series, (rows) => new Map(rows.map((row) => [row.day, row.value])));

  return keys.map((date) => ({
    date,
    revenue: byDay.revenue.get(date) ?? 0,
    payments: byDay.payments.get(date) ?? 0,
    signups: byDay.signups.get(date) ?? 0,
    newPaid: byDay.newPaid.get(date) ?? 0,
    trials: byDay.trials.get(date) ?? 0
  }));
};
