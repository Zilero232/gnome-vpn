import { milliseconds } from 'date-fns';

export const ADMIN_THROTTLE = {
  read: { default: { ttl: milliseconds({ minutes: 1 }), limit: 120 } },
  write: { default: { ttl: milliseconds({ minutes: 1 }), limit: 20 } },
  export: { default: { ttl: milliseconds({ minutes: 1 }), limit: 6 } }
} as const;
