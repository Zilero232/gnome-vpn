import type { AdminDay } from '@gnomevpn/schemas';

import { range } from 'remeda';

import type { AlignSeriesInput, BucketStartInput, BuildDaysInput, DayKeysInput } from './day-buckets.types';

import { DAY_BUCKET } from './day-buckets.constants';

export const dayKey = (date: Date): string => date.toISOString().slice(0, DAY_BUCKET.keyLength);

export const bucketStart = ({ now, days }: BucketStartInput): Date => {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  return new Date(today - (days - 1) * DAY_BUCKET.ms);
};

export const dayKeys = ({ start, days }: DayKeysInput): string[] =>
  range(0, days).map((offset) => dayKey(new Date(start.getTime() + offset * DAY_BUCKET.ms)));

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
