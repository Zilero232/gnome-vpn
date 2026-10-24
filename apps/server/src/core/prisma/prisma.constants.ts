import type { PoolConfig } from 'pg';

export const PRISMA_ERROR = {
  notFound: 'P2025',
  uniqueViolation: 'P2002',
  serializationFailure: 'P2034'
} as const;

export const PRISMA_RETRY = {
  serializable: { retries: 4, minTimeoutMs: 25 },
  unique: { retries: 1, minTimeoutMs: 10 }
} as const;

export const PG_POOL = {
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  maxLifetimeSeconds: 300,
  keepAlive: true,
  keepAliveInitialDelayMillis: 5_000,
  allowExitOnIdle: false
} as const satisfies PoolConfig;
