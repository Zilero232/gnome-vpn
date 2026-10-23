import type { SubscriptionLink } from '@gnomevpn/schemas';

import { encryptLink } from '@incy/link-encoder';
import { Injectable } from '@nestjs/common';

import type { PresentLinkInput } from '../subscription-link.service.types';

import { AppConfigService } from '../../../config';
import { PrismaService, withUniqueRetry } from '../../../core';
import { DEVICE_KEY } from '../../devices';
import { FEED } from '../config';
import { clientLinks, generateSubscriptionToken } from '../lib';

@Injectable()
export class SubscriptionLinkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService
  ) {}

  async get(userId: string): Promise<SubscriptionLink> {
    const row = await withUniqueRetry(() =>
      this.prisma.subscriptionLink.upsert({
        where: { userId },
        update: {},
        create: { userId, token: generateSubscriptionToken() },
        select: { token: true, createdAt: true }
      })
    );

    return this.present(row);
  }

  async rotate(userId: string): Promise<SubscriptionLink> {
    const token = generateSubscriptionToken();

    const row = await this.prisma.$transaction(async (tx) => {
      const feeds = await tx.device.findMany({
        where: { userId, NOT: { key: { startsWith: DEVICE_KEY.wireguard } } },
        select: { id: true }
      });

      const deviceIds = feeds.map((device) => device.id);

      await tx.peer.updateMany({
        where: { userId, kind: 'config', revokedAt: null, OR: [{ deviceId: null }, { deviceId: { in: deviceIds } }] },
        data: { revokedAt: new Date(), state: 'disabled' }
      });

      await tx.device.deleteMany({ where: { id: { in: deviceIds } } });

      return tx.subscriptionLink.upsert({
        where: { userId },
        update: { token, blockedKey: null, blockedNoticeAt: null },
        create: { userId, token },
        select: { token: true, createdAt: true }
      });
    });

    return this.present(row);
  }

  private present({ token, createdAt }: PresentLinkInput): SubscriptionLink {
    const url = new URL(`${FEED.path}/${token}`, this.config.get('API_URL')).toString();
    const deepLink = encryptLink(url, { name: FEED.deepLinkName });

    return {
      url,
      deepLink,
      clients: clientLinks({ url, deepLink }),
      createdAt: createdAt.toISOString()
    };
  }
}
