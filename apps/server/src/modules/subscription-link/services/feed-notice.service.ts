import { Injectable } from '@nestjs/common';
import { subHours } from 'date-fns';
import { isNullish } from 'remeda';

import type { DeviceAddedInput, DeviceBlockedInput } from '../subscription-link.service.types';

import { PrismaService } from '../../../core';
import { DEVICE_KEY, deviceTitle } from '../../devices';
import { TelegramNotifyService } from '../../telegram/services/telegram-notify.service';
import { DEVICE_NOTICE } from '../config';
import { claimBlockedNotice } from '../lib';

@Injectable()
export class FeedNoticeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: TelegramNotifyService
  ) {}

  async deviceAdded({ userId, identity, deviceCount, deviceLimit }: DeviceAddedInput): Promise<void> {
    await this.notify.tell({
      userId,
      notice: identity.key.startsWith(DEVICE_KEY.wireguard) ? 'wireguardAdded' : 'deviceAdded',
      fill: { name: deviceTitle(identity), count: String(deviceCount), limit: String(deviceLimit) }
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
}
