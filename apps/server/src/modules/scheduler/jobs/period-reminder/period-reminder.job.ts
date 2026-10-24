import { findPlan } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addHours, differenceInHours } from 'date-fns';

import type { NotifyInput } from '@/modules/telegram/notify';

import { describeError } from '@/common/lib';
import { AppConfigService } from '@/config';
import { claimNotice, NOTICE_CLAIM, PrismaService } from '@/core';
import { WINDOW } from '@/modules/scheduler/config';
import { periodKind } from '@/modules/subscription';
import { TelegramNotifyService } from '@/modules/telegram/notify';

import type { EndingSubscription } from './period-reminder.job.types';

@Injectable()
export class PeriodReminderJob {
  private readonly logger = new Logger(PeriodReminderJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly notify: TelegramNotifyService
  ) {}

  private reminderFor(subscription: EndingSubscription): NotifyInput | null {
    const { userId, currentPeriodEnd } = subscription;
    const hoursLeft = differenceInHours(currentPeriodEnd, new Date());

    if (periodKind(subscription) === 'trial') {
      return hoursLeft < WINDOW.trialRemindHours ? { userId, notice: 'trialEndingSoon' } : null;
    }

    const willCharge = !subscription.cancelAtPeriodEnd && subscription.savedCardId !== null && this.config.get('yookassa').isRecurringEnabled;

    if (!willCharge) {
      return { userId, notice: 'endingSoon', date: currentPeriodEnd };
    }

    if (hoursLeft < WINDOW.renewHours) {
      return null;
    }

    const fill = { amount: String(findPlan(subscription.plan).priceRub), card: subscription.savedCardTitle ?? '****' };

    return { userId, notice: 'renewSoon', date: currentPeriodEnd, fill };
  }

  private async remind(subscription: EndingSubscription): Promise<void> {
    const reminder = this.reminderFor(subscription);

    if (!reminder) {
      return;
    }

    const isClaimed = await claimNotice({
      db: this.prisma,
      userId: subscription.userId,
      notice: NOTICE_CLAIM.periodReminder,
      ref: subscription.currentPeriodEnd.toISOString()
    });

    if (isClaimed) {
      await this.notify.tell(reminder);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async run(): Promise<void> {
    const now = new Date();

    const ending = await this.prisma.subscription.findMany({
      where: { currentPeriodEnd: { gt: now, lt: addHours(now, WINDOW.remindHours) } },
      select: {
        userId: true,
        plan: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        savedCardId: true,
        savedCardTitle: true,
        trialStartedAt: true
      }
    });

    const reminded = await this.prisma.noticeLog.findMany({
      where: { notice: NOTICE_CLAIM.periodReminder, userId: { in: ending.map((row) => row.userId) } },
      select: { userId: true, ref: true }
    });

    const sent = new Set(reminded.map(({ userId, ref }) => `${userId}|${ref}`));

    const unreminded = ending.filter(
      (row): row is EndingSubscription => row.currentPeriodEnd !== null && !sent.has(`${row.userId}|${row.currentPeriodEnd.toISOString()}`)
    );

    for (const subscription of unreminded) {
      try {
        await this.remind(subscription);
      } catch (error) {
        this.logger.warn(`Period reminder failed for ${subscription.userId}: ${describeError(error)}`);
      }
    }
  }
}
