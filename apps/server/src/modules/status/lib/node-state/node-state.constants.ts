import { milliseconds } from 'date-fns';

export const NODE_DOWN = {
  failedChecks: 3,
  checkIntervalMs: milliseconds({ minutes: 1 })
} as const;
