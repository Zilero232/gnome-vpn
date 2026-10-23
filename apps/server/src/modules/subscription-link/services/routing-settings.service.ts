import type { RoutingSettings } from '@gnomevpn/schemas';

import { Injectable } from '@nestjs/common';
import { isDeepEqual, pick } from 'remeda';

import type { StoredRouting } from '../lib';
import type { UpdateRoutingSettingsServiceInput } from '../subscription-link.service.types';

import { PrismaService, withUniqueRetry } from '../../../core';
import { ROUTING_SELECT } from '../config';
import { generateSubscriptionToken, nextRoutingStamp } from '../lib';

@Injectable()
export class RoutingSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string): Promise<RoutingSettings> {
    return pick(await this.stored(userId), ['ruDirect', 'blockAds']);
  }

  async update({ userId, patch }: UpdateRoutingSettingsServiceInput): Promise<RoutingSettings> {
    const stored = await this.stored(userId);
    const current = pick(stored, ['ruDirect', 'blockAds']);

    if (isDeepEqual(current, { ...current, ...patch })) {
      return current;
    }

    return this.prisma.subscriptionLink.update({
      where: { userId },
      data: { ...patch, routingUpdatedAt: nextRoutingStamp({ previous: stored.routingUpdatedAt, now: new Date() }) },
      select: ROUTING_SELECT.settings
    });
  }

  private stored(userId: string): Promise<StoredRouting> {
    return withUniqueRetry(() =>
      this.prisma.subscriptionLink.upsert({
        where: { userId },
        update: {},
        create: { userId, token: generateSubscriptionToken() },
        select: ROUTING_SELECT.stored
      })
    );
  }
}
