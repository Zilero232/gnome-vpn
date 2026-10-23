import { milliseconds } from 'date-fns';

export const CONNECTION_CHECK = {
  throttle: { ttl: milliseconds({ minutes: 1 }), limit: 20 },
  addressCacheKey: 'status:node-addresses',
  addressCacheTtlMs: milliseconds({ minutes: 5 }),
  failedLookupTtlMs: milliseconds({ seconds: 30 }),
  resolver: { timeout: milliseconds({ seconds: 2 }), tries: 1 }
} as const;
