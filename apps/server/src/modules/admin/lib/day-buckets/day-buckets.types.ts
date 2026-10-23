import type { AdminDay } from '@gnomevpn/schemas';

export type BucketStartInput = {
  now: Date;
  days: number;
};

export type DayKeysInput = {
  start: Date;
  days: number;
};

export type DayRow = {
  day: string;
  value: number;
};

export type AlignSeriesInput = {
  keys: string[];
  rows: DayRow[];
};

export type DaySeries = Record<Exclude<keyof AdminDay, 'date'>, DayRow[]>;

export type BuildDaysInput = {
  keys: string[];
  series: DaySeries;
};
