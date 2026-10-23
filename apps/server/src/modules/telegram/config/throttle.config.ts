import { CHECKOUT } from './checkout.config';
import { OWNER_ALERT } from './owner-alert.config';
import { SUPPORT } from './support.config';

export const BOT_THROTTLE = {
  keyPrefix: 'telegram',
  blockMs: 0,
  limits: {
    checkout: { windowMs: CHECKOUT.throttleMs, limit: 1 },
    ownerAlert: { windowMs: OWNER_ALERT.repeatMs, limit: 1 },
    refundCanceled: { windowMs: OWNER_ALERT.refundCanceledRepeatMs, limit: 1 },
    supportRate: SUPPORT.rateLimit,
    supportSlowDown: { windowMs: SUPPORT.rateLimit.windowMs, limit: 1 },
    supportAck: { windowMs: SUPPORT.ackWindowMs, limit: 1 },
    supportAnswerTitle: { windowMs: SUPPORT.answerTitleWindowMs, limit: 1 }
  }
} as const;
