import { milliseconds } from 'date-fns';

const SUPPORT_WINDOW_MS = milliseconds({ minutes: 10 });

export const BOT_THROTTLE = {
  keyPrefix: 'telegram',
  blockMs: 0,
  limits: {
    checkout: { windowMs: milliseconds({ seconds: 10 }), limit: 1 },
    ownerAlert: { windowMs: milliseconds({ hours: 1 }), limit: 1 },
    refundCanceled: { windowMs: milliseconds({ days: 1 }), limit: 1 },
    supportRate: { windowMs: SUPPORT_WINDOW_MS, limit: 20 },
    supportSlowDown: { windowMs: SUPPORT_WINDOW_MS, limit: 1 },
    supportAck: { windowMs: milliseconds({ minutes: 5 }), limit: 1 },
    supportAnswerTitle: { windowMs: SUPPORT_WINDOW_MS, limit: 1 }
  }
} as const;
