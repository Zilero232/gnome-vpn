import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { subHours } from 'date-fns';
import { isEmpty, zip } from 'remeda';

import { describeError } from '@/common/lib';
import { PrismaService } from '@/core';
import { WINDOW } from '@/modules/scheduler/config';
import { activeSince, lapsedBefore } from '@/modules/scheduler/lib';
import { SubscriptionAccessService } from '@/modules/subscription-link';
import { TelegramNotifyService } from '@/modules/telegram/notify';

import type { OwnersOfInput, SweepInput } from './expired-access.job.types';

@Injectable()
export class ExpiredAccessJob {
  private readonly logger = new Logger(ExpiredAccessJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: SubscriptionAccessService,
    private readonly notify: TelegramNotifyService
  ) {}

  private async ownersOf({ user, state }: OwnersOfInput): Promise<string[]> {
    const peers = await this.prisma.peer.findMany({
      where: { kind: 'config', revokedAt: null, user, ...(state ? { state } : {}) },
      select: { userId: true },
      distinct: ['userId']
    });

    return peers.map((peer) => peer.userId);
  }

  private async sweep({ user, state, act }: SweepInput): Promise<string[]> {
    const owners = await this.ownersOf({ user, state });

    const results = await Promise.allSettled(owners.map((userId) => act(userId)));

    const failed = results.filter((result) => result.status === 'rejected');

    for (const result of failed) {
      this.logger.error(`sweeping a subscriber failed: ${describeError(result.reason)}`);
    }

    return zip(owners, results).flatMap(([userId, result]) => (result.status === 'fulfilled' && result.value > 0 ? [userId] : []));
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async run(): Promise<void> {
    const now = new Date();

    const lapsed = lapsedBefore(subHours(now, WINDOW.configGraceHours));
    const active = activeSince(now);

    const [disabled, restored] = await Promise.all([
      this.sweep({
        user: lapsed,
        state: 'active',
        act: (userId) => this.access.setEnabledAll({ userId, enabled: false, owner: lapsed })
      }),
      this.sweep({
        user: active,
        state: 'disabled',
        act: (userId) => this.access.setEnabledAll({ userId, enabled: true, owner: active })
      })
    ]);

    if (!isEmpty(disabled)) {
      this.logger.log(`Disabled access for ${disabled.length} subscriber(s)`);

      await Promise.allSettled(disabled.map((userId) => this.notify.tell({ userId, notice: 'expired' })));
    }

    if (!isEmpty(restored)) {
      this.logger.log(`Restored access for ${restored.length} subscriber(s)`);
    }
  }
}
