import { milliseconds } from 'date-fns';

import type { Prisma } from '@/generated';

export const CONNECTION_CHECK = {
  throttle: { ttl: milliseconds({ minutes: 1 }), limit: 20 },
  addressCacheKey: 'status:node-addresses',
  addressCacheTtlMs: milliseconds({ minutes: 5 }),
  failedLookupTtlMs: milliseconds({ seconds: 30 }),
  resolver: { timeout: milliseconds({ seconds: 2 }), tries: 1 }
} as const;

export const ADDRESS_NODE_SELECT = {
  id: true,
  host: true,
  countryCode: true
} as const satisfies Prisma.NodeSelect;
