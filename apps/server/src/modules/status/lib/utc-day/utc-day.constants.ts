import { milliseconds } from 'date-fns';

export const UTC_DAY = {
  ms: milliseconds({ days: 1 }),
  keyLength: 'YYYY-MM-DD'.length
} as const;
