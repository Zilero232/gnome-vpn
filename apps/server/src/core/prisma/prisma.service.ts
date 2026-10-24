import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { env } from '@/config';
import { PrismaClient } from '@/generated';

import type { PrismaExecutor } from './prisma.types';

import { createPool } from './pg-pool';
import { withSerializableRetry } from './prisma-retry';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      adapter: new PrismaPg(createPool(env.database.url)),
      log: env.app.isDevelopment ? ['error', 'warn'] : ['error']
    });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  serializable<T>(work: (tx: PrismaExecutor) => Promise<T>): Promise<T> {
    return withSerializableRetry(() => this.$transaction(work, { isolationLevel: 'Serializable' }));
  }
}
