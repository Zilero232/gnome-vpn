import { Logger } from '@nestjs/common';
import { Pool } from 'pg';

import { env } from '@/config';

import { PG_POOL } from './prisma.constants';

const logger = new Logger('PgPool');

const globalForPools = globalThis as unknown as { pgPools?: Pool[] };

if (env.app.isDevelopment) {
  for (const stale of globalForPools.pgPools ?? []) {
    void stale.end().catch(() => {});
  }

  globalForPools.pgPools = [];
}

export const createPool = (connectionString: string): Pool => {
  const pool = new Pool({ connectionString, ...PG_POOL });

  pool.on('error', (error) => {
    logger.warn(`idle connection dropped: ${error.message}`);
  });

  if (env.app.isDevelopment) {
    globalForPools.pgPools?.push(pool);
  }

  return pool;
};
