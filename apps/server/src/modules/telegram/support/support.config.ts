import { milliseconds } from 'date-fns';

export const SUPPORT = {
  threadWindowMs: milliseconds({ minutes: 10 }),
  answeredReaction: '👍'
} as const;
