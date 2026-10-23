import { milliseconds } from 'date-fns';

export const DAY_BUCKET = {
  ms: milliseconds({ days: 1 }),
  keyLength: 10
} as const;
