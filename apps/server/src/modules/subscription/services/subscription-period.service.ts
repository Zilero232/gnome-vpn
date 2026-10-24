import { DEFAULT_PLAN_ID, MAX_EXTRA_DEVICES } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isNullish } from 'remeda';

import { accessExtension, extendPeriod, extraDevicesGrant, rewindPeriod } from '@/common/lib';
import { PrismaService } from '@/core';

import type { ExtendAccessInput, ExtraDevicesChangeInput, PeriodDaysInput, RewindInput } from '../subscription.types';

import { periodKind } from '../lib';

@Injectable()
export class SubscriptionPeriodService {
  private readonly logger = new Logger(SubscriptionPeriodService.name);

  constructor(private readonly prisma: PrismaService) {}

  async periodEnd(userId: string): Promise<Date | null> {
    const subscription = await this.prisma.subscription.findUnique({ where: { userId }, select: { currentPeriodEnd: true } });

    return subscription?.currentPeriodEnd ?? null;
  }

  async extend({ userId, days, db }: PeriodDaysInput): Promise<void> {
    const { currentPeriodEnd } = await db.subscription.findUniqueOrThrow({ where: { userId }, select: { currentPeriodEnd: true } });

    await db.subscription.update({
      where: { userId },
      data: { currentPeriodEnd: extendPeriod({ currentPeriodEnd, days }) }
    });
  }

  async extendAccess({ userId, days, now, db }: ExtendAccessInput): Promise<Date> {
    const subscription = await db.subscription.findUnique({ where: { userId }, select: { currentPeriodEnd: true } });
    const extension = accessExtension({ currentPeriodEnd: subscription?.currentPeriodEnd, days, now });
    const data = { currentPeriodEnd: extension.currentPeriodEnd, ...(extension.resetsExtras && { extraDevices: 0 }) };

    await db.subscription.upsert({
      where: { userId },
      create: { userId, plan: DEFAULT_PLAN_ID, ...data },
      update: data
    });

    return extension.currentPeriodEnd;
  }

  async rewind({ userId, months = 0, days = 0, stopsRenewal = false, db }: RewindInput): Promise<boolean> {
    if (months <= 0 && days <= 0) {
      return false;
    }

    const subscription = await db.subscription.findUnique({ where: { userId }, select: { currentPeriodEnd: true } });

    if (isNullish(subscription)) {
      return false;
    }

    await db.subscription.update({
      where: { userId },
      data: {
        currentPeriodEnd: rewindPeriod({ currentPeriodEnd: subscription.currentPeriodEnd, months, days }),
        ...(stopsRenewal && { cancelAtPeriodEnd: true })
      }
    });

    return true;
  }

  async creditDays({ userId, days, db }: PeriodDaysInput): Promise<boolean> {
    const subscription = await db.subscription.findUnique({ where: { userId }, select: { currentPeriodEnd: true, trialStartedAt: true } });

    if (periodKind(subscription) === 'paid') {
      await this.extend({ userId, days, db });

      return false;
    }

    await db.subscription.upsert({
      where: { userId },
      create: { userId, bonusDays: days },
      update: { bonusDays: { increment: days } }
    });

    return true;
  }

  async debitDays({ userId, days, db }: PeriodDaysInput): Promise<void> {
    const subscription = await db.subscription.findUnique({ where: { userId }, select: { bonusDays: true } });

    if (isNullish(subscription)) {
      return;
    }

    const fromBank = Math.min(subscription.bonusDays, days);

    if (fromBank > 0) {
      await db.subscription.update({ where: { userId }, data: { bonusDays: { decrement: fromBank } } });
    }

    await this.rewind({ userId, days: days - fromBank, db });
  }

  async addExtraDevices({ userId, quantity, db }: ExtraDevicesChangeInput): Promise<void> {
    const subscription = await db.subscription.findUnique({ where: { userId }, select: { extraDevices: true } });

    if (isNullish(subscription)) {
      this.logger.warn(`paid extra devices for ${userId} without a subscription row`);

      return;
    }

    const { granted, dropped } = extraDevicesGrant({ current: subscription.extraDevices, quantity });

    if (dropped > 0) {
      this.logger.error(
        `extra-devices overflow for ${userId}: paid ${quantity}, granted ${granted - subscription.extraDevices}, ${dropped} dropped over MAX ${MAX_EXTRA_DEVICES} — manual review needed`
      );
    }

    await db.subscription.update({ where: { userId }, data: { extraDevices: granted } });
  }

  async removeExtraDevices({ userId, quantity, db }: ExtraDevicesChangeInput): Promise<void> {
    const subscription = await db.subscription.findUnique({ where: { userId }, select: { extraDevices: true } });

    if (isNullish(subscription)) {
      return;
    }

    await db.subscription.update({
      where: { userId },
      data: { extraDevices: Math.max(0, subscription.extraDevices - quantity) }
    });
  }
}
