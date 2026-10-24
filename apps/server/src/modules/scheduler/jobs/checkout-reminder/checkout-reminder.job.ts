import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { subHours, subMinutes } from 'date-fns';

import { describeError } from '@/common/lib';
import { claimNotice, NOTICE_CLAIM, PrismaService } from '@/core';
import { CHECKOUT_REMINDER, REACHABLE_USER } from '@/modules/scheduler/config';
import { TelegramNotifyService } from '@/modules/telegram/notify';

import type { RemindInput } from './checkout-reminder.job.types';

import { abandonedCheckouts } from './lib';

@Injectable()
export class CheckoutReminderJob {
  private readonly logger = new Logger(CheckoutReminderJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: TelegramNotifyService
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async run(): Promise<void> {
    const now = new Date();

    const rows = await this.prisma.payment.findMany({
      where: {
        isAutoCharge: false,
        kind: { in: [...CHECKOUT_REMINDER.kinds] },
        status: { in: [...CHECKOUT_REMINDER.statuses] },
        createdAt: { gt: subHours(now, CHECKOUT_REMINDER.lookbackHours), lte: subMinutes(now, CHECKOUT_REMINDER.afterMinutes) },
        user: { is: REACHABLE_USER }
      },
      select: { id: true, userId: true, kind: true, createdAt: true }
    });

    const reminded = await this.prisma.noticeLog.findMany({
      where: { notice: NOTICE_CLAIM.checkoutReminder, ref: { in: rows.map((row) => row.id) } },
      select: { ref: true }
    });

    const remindedIds = new Set(reminded.map((claim) => claim.ref));

    let sent = 0;

    for (const checkout of abandonedCheckouts(rows.filter((row) => !remindedIds.has(row.id)))) {
      try {
        sent += (await this.remind({ checkout, now })) ? 1 : 0;
      } catch (error) {
        this.logger.warn(`Checkout reminder failed for payment ${checkout.id}: ${describeError(error)}`);
      }
    }

    if (sent > 0) {
      this.logger.log(`Reminded ${sent} account(s) of an unfinished checkout`);
    }
  }

  private async remind({ checkout, now }: RemindInput): Promise<boolean> {
    const { id, userId, createdAt, notice } = checkout;

    const isClaimed = await this.prisma.serializable(async (tx) => {
      const [later, recent, unpaid] = await Promise.all([
        tx.payment.count({ where: { userId, id: { not: id }, createdAt: { gte: createdAt }, status: { not: 'canceled' } } }),
        tx.noticeLog.count({
          where: { userId, notice: NOTICE_CLAIM.checkoutReminder, sentAt: { gt: subHours(now, CHECKOUT_REMINDER.userGapHours) } }
        }),
        tx.payment.count({ where: { id, status: { in: [...CHECKOUT_REMINDER.statuses] } } })
      ]);

      if (later > 0 || recent > 0 || unpaid === 0) {
        return false;
      }

      return claimNotice({ db: tx, userId, notice: NOTICE_CLAIM.checkoutReminder, ref: id, sentAt: now });
    });

    if (isClaimed) {
      await this.notify.tell({ userId, notice });
    }

    return isClaimed;
  }
}
