import { milliseconds } from 'date-fns';

export const ADMIN_ACCESS = {
  staleMs: milliseconds({ minutes: 5 })
} as const;
