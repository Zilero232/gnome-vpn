import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { groupBy, isNonNullish, isNullish } from 'remeda';

import { describeError } from '@/common/lib';
import { claimNotice, NOTICE_CLAIM, PrismaService } from '@/core';
import { ConsentService } from '@/modules/consents';
import { AutoDiscountService } from '@/modules/promo-codes';
import { REACHABLE_USER, SCHEDULE, WIN_BACK } from '@/modules/scheduler/config';
import { TelegramNotifyService } from '@/modules/telegram/services/telegram-notify.service';

import type { WinBackCandidate, WinBackCodes, WinBackTouchInput } from './win-back.job.types';

import { liveCode, sentTouches, winBackDue, winBackMessage, winBackWindow } from './lib';

@Injectable()
export class WinBackJob {
  private readonly logger = new Logger(WinBackJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly autoDiscounts: AutoDiscountService,
    private readonly consents: ConsentService,
    private readonly notify: TelegramNotifyService
  ) {}

  @Cron(SCHEDULE.winBackCron, { timeZone: SCHEDULE.localTimeZone })
  async run(): Promise<void> {
    const now = new Date();
    const codes = await this.liveCodes(now);

    if (isNullish(codes.lapsed) && isNullish(codes.trial)) {
      return;
    }

    const window = winBackWindow(now);

    const rows = await this.prisma.subscription.findMany({
      where: { currentPeriodEnd: { gte: window.from, lt: window.to }, user: REACHABLE_USER },
      select: {
        id: true,
        userId: true,
        currentPeriodEnd: true,
        trialStartedAt: true,
        user: { select: { _count: { select: { payments: { where: { status: 'succeeded', kind: 'subscription' } } } } } }
      }
    });

    const userIds = rows.map((row) => row.userId);

    const [audience, log] = await Promise.all([
      this.consents.marketingAudience(userIds),
      this.prisma.noticeLog.findMany({
        where: { userId: { in: userIds }, notice: { in: WIN_BACK.claims } },
        select: { userId: true, notice: true, ref: true }
      })
    ]);

    const claimsOf = groupBy(log, (claim) => claim.userId);

    let sent = 0;

    for (const { user, currentPeriodEnd, ...rest } of rows) {
      if (isNullish(currentPeriodEnd) || !audience.has(rest.userId)) {
        continue;
      }

      const candidate: WinBackCandidate = { ...rest, currentPeriodEnd, claims: claimsOf[rest.userId] ?? [] };
      const due = winBackDue({ row: candidate, hasPaid: user._count.payments > 0, now });

      if (isNullish(due)) {
        continue;
      }

      const code = codes[due.audience];

      if (isNullish(code)) {
        continue;
      }

      try {
        sent += (await this.touch({ candidate, due, code })) ? 1 : 0;
      } catch (error) {
        this.logger.warn(`Win-back touch ${due.touch} failed for ${candidate.userId}: ${describeError(error)}`);
      }
    }

    if (sent > 0) {
      this.logger.log(`Sent ${sent} win-back message(s)`);
    }
  }

  private async touch({ candidate, due, code }: WinBackTouchInput): Promise<boolean> {
    const { id, userId, currentPeriodEnd } = candidate;
    const ref = currentPeriodEnd.toISOString();

    const offer = await this.prisma.serializable(async (tx) => {
      const [current, claims] = await Promise.all([
        tx.subscription.findUnique({ where: { id }, select: { currentPeriodEnd: true } }),
        tx.noticeLog.findMany({ where: { userId, ref, notice: { in: WIN_BACK.claims } }, select: { notice: true, ref: true } })
      ]);

      const isSameLapse = current?.currentPeriodEnd?.getTime() === currentPeriodEnd.getTime();
      const isUnchanged = sentTouches({ ...candidate, claims }) === sentTouches(candidate);

      if (!isSameLapse || !isUnchanged) {
        return null;
      }

      const isClaimed = await claimNotice({ db: tx, userId, notice: NOTICE_CLAIM.winBackTouch[due.touch], ref });

      return isClaimed ? this.autoDiscounts.offer({ userId, code, db: tx }) : null;
    });

    const message = isNonNullish(offer) ? winBackMessage({ audience: due.audience, offer }) : null;

    if (isNullish(message)) {
      return false;
    }

    await this.notify.tell({ userId, notice: message.notice, fill: { percent: String(message.percent) } });

    return true;
  }

  private async liveCodes(now: Date): Promise<WinBackCodes> {
    const [lapsed, trial] = await Promise.all([
      this.autoDiscounts.ensure({ code: WIN_BACK.codes.lapsed, percent: WIN_BACK.percent }),
      this.autoDiscounts.ensure({ code: WIN_BACK.codes.trial, percent: WIN_BACK.percent })
    ]);

    return { lapsed: liveCode({ code: lapsed, now }), trial: liveCode({ code: trial, now }) };
  }
}
