import { milliseconds } from 'date-fns';

export const NODE_DOWN = {
  statusPage: {
    failedChecks: 3,
    checkIntervalMs: milliseconds({ minutes: 1 })
  },
  feed: {
    staleMinutes: 10
  }
} as const;

export const NODE_LOSS = {
  degradedPercent: 10
} as const;
