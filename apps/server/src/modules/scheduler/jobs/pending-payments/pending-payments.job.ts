import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { subDays, subMinutes } from 'date-fns';

import { describeError } from '@/common/lib';
import { PrismaService } from '@/core';
import { SettlementService } from '@/modules/billing';
import { PENDING } from '@/modules/scheduler/config';

@Injectable()
export class PendingPaymentsJob {
  private readonly logger = new Logger(PendingPaymentsJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settlement: SettlementService
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async run(): Promise<void> {
    const now = new Date();

    const stuck = await this.prisma.payment.findMany({
      where: {
        status: 'pending',
        createdAt: { gt: subDays(now, PENDING.lookbackDays), lt: subMinutes(now, PENDING.settleAfterMinutes) }
      },
      select: { yookassaPaymentId: true }
    });

    for (const { yookassaPaymentId } of stuck) {
      try {
        await this.settlement.settlePayment(yookassaPaymentId);
      } catch (error) {
        this.logger.warn(`Could not settle pending payment ${yookassaPaymentId}: ${describeError(error)}`);
      }
    }
  }
}
