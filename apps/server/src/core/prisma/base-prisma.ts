import { PrismaPg } from '@prisma/adapter-pg';

import { env } from '@/config';
import { PrismaClient } from '@/generated';

import { createPool } from './pg-pool';

const globalForPrisma = globalThis as unknown as { basePrisma?: PrismaClient };

const createBasePrisma = (): PrismaClient => new PrismaClient({ adapter: new PrismaPg(createPool(env.database.url)) });

export const basePrisma = globalForPrisma.basePrisma ?? createBasePrisma();

if (env.app.isDevelopment) {
  globalForPrisma.basePrisma = basePrisma;
}
