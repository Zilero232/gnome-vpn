import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { subDays } from 'date-fns';

import { describeError } from '../../../../common/lib';
import { PrismaService } from '../../../../core';
import { RETENTION } from '../../config';

@Injectable()
export class SupportThreadsJob {
  private readonly logger = new Logger(SupportThreadsJob.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async run(): Promise<void> {
    try {
      const { count } = await this.prisma.telegramSupportMessage.deleteMany({
        where: { createdAt: { lt: subDays(new Date(), RETENTION.supportMessageDays) } }
      });

      if (count > 0) {
        this.logger.log(`Forgot ${count} support message(s) older than ${RETENTION.supportMessageDays} days`);
      }
    } catch (error) {
      this.logger.warn(`Support message cleanup failed: ${describeError(error)}`);
    }
  }
}
