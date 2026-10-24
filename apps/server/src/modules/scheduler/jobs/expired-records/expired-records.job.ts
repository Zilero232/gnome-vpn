import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { subDays } from 'date-fns';

import { describeError } from '@/common/lib';
import { PrismaService } from '@/core';
import { RETENTION, SCHEDULE } from '@/modules/scheduler/config';

@Injectable()
export class ExpiredRecordsJob {
  private readonly logger = new Logger(ExpiredRecordsJob.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(SCHEDULE.expiredRecordsCron)
  async run(): Promise<void> {
    const now = new Date();
    const sessionsBefore = { expiresAt: { lt: subDays(now, RETENTION.expiredSessionDays) } };
    const codesBefore = { expiresAt: { lt: subDays(now, RETENTION.expiredCodeDays) } };

    try {
      const [sessions, verifications, linkCodes, webLogins] = await this.prisma.$transaction([
        this.prisma.session.deleteMany({ where: sessionsBefore }),
        this.prisma.verification.deleteMany({ where: codesBefore }),
        this.prisma.telegramLinkCode.deleteMany({ where: codesBefore }),
        this.prisma.telegramWebLogin.deleteMany({ where: codesBefore })
      ]);

      const total = sessions.count + verifications.count + linkCodes.count + webLogins.count;

      if (total > 0) {
        this.logger.log(
          `Forgot ${sessions.count} expired session(s), ${verifications.count} verification(s), ${linkCodes.count} link code(s) and ${webLogins.count} sign-in link(s)`
        );
      }
    } catch (error) {
      this.logger.warn(`Expired record cleanup failed: ${describeError(error)}`);
    }
  }
}
