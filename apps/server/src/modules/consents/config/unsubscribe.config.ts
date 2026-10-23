import { milliseconds } from 'date-fns';

export const UNSUBSCRIBE = {
  path: '/unsubscribe',
  tokenParam: 'token',
  throttle: { ttl: milliseconds({ minutes: 1 }), limit: 20 }
} as const;
