import { milliseconds } from 'date-fns';

export const SUPPORT = {
  ackWindowMs: milliseconds({ minutes: 5 }),
  threadWindowMs: milliseconds({ minutes: 10 }),
  answerTitleWindowMs: milliseconds({ minutes: 10 }),
  rateLimit: { limit: 20, windowMs: milliseconds({ minutes: 10 }) },
  commandPrefix: '/',
  answeredReaction: '👍'
} as const;

export const SUPPORT_MEDIA = [
  'message:photo',
  'message:document',
  'message:voice',
  'message:audio',
  'message:video',
  'message:video_note',
  'message:animation',
  'message:sticker'
] as const;
