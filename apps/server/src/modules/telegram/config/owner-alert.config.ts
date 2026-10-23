import { milliseconds } from 'date-fns';

export const OWNER_ALERT = {
  repeatMs: milliseconds({ hours: 1 }),
  refundCanceledRepeatMs: milliseconds({ days: 1 }),
  nodeDownAfterMinutes: 3,
  errorLength: 300
} as const;
