import type { PlanId } from '@gnomevpn/schemas';

import { DEFAULT_PLAN_ID } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { subHours } from 'date-fns';
import { isNullish } from 'remeda';

import { describeError } from '@/common/lib';
import { claimNotice, NOTICE_CLAIM, NOTICE_REF, PrismaService } from '@/core';
import { DEVICE_KEY, deviceTitle } from '@/modules/devices';
import { TelegramNotifyService } from '@/modules/telegram/notify';

import type { DeviceAddedInput, DeviceBlockedInput } from '../subscription-link.service.types';

import { DEVICE_NOTICE } from '../config';
import { claimBlockedNotice } from '../lib';

@Injectable()
export class FeedNoticeService {
  private readonly logger = new Logger(FeedNoticeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: TelegramNotifyService
  ) {}

  async deviceAdded({ userId, identity, deviceCount, deviceLimit }: DeviceAddedInput): Promise<void> {
    await this.notify.tell({
      userId,
      notice: identity.key.startsWith(DEVICE_KEY.wireguard) ? 'wireguardAdded' : 'deviceAdded',
      fill: { name: deviceTitle(identity), count: String(deviceCount), limit: String(deviceLimit) },
      invite: await this.firstDeviceInvite(userId)
    });
  }

  async deviceBlocked({ token, userId, identity, deviceLimit }: DeviceBlockedInput): Promise<void> {
    const now = new Date();

    const link = await this.prisma.subscriptionLink.findUnique({
      where: { token },
      select: { blockedKey: true, blockedNoticeAt: true }
    });

    if (isNullish(link)) {
      return;
    }

    const next = claimBlockedNotice({
      stored: link.blockedKey,
      noticeAt: link.blockedNoticeAt,
      key: identity.key,
      windowStart: subHours(now, DEVICE_NOTICE.blockedRepeatHours)
    });

    if (isNullish(next)) {
      return;
    }

    const claimed = await this.prisma.subscriptionLink.updateMany({
      where: { token, blockedKey: link.blockedKey, blockedNoticeAt: link.blockedNoticeAt },
      data: { blockedKey: next, blockedNoticeAt: next === identity.key ? now : link.blockedNoticeAt }
    });

    if (claimed.count === 0) {
      return;
    }

    await this.notify.tell({
      userId,
      notice: 'deviceBlocked',
      fill: { name: deviceTitle(identity), limit: String(deviceLimit) }
    });
  }

  private async firstDeviceInvite(userId: string): Promise<PlanId | undefined> {
    try {
      const isFirst = await claimNotice({ db: this.prisma, userId, notice: NOTICE_CLAIM.firstDevice, ref: NOTICE_REF.ever });

      if (!isFirst) {
        return undefined;
      }

      const subscription = await this.prisma.subscription.findUnique({ where: { userId }, select: { plan: true } });

      return subscription?.plan ?? DEFAULT_PLAN_ID;
    } catch (error) {
      this.logger.warn(`could not tell whether ${userId} added a first device: ${describeError(error)}`);

      return undefined;
    }
  }
}
