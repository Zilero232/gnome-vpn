import type { AdminExtendResult, AdminMessageResult } from '@gnomevpn/schemas';

import { adminExtendResultSchema, adminMessageResultSchema, DEFAULT_PLAN_ID, isPlaceholderEmail } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isNullish } from 'remeda';

import type { AdminActionInput, ExtendActionInput, ExtendWithinInput, MessageActionInput, RemoveDeviceActionInput } from '../admin.types';

import { AppBadRequestException, AppNotFoundException } from '../../../common/exceptions';
import { describeError } from '../../../common/lib';
import { PrismaService, withSerializableRetry, withUniqueRetry } from '../../../core';
import { AutoRenewService } from '../../billing';
import { DevicesService } from '../../devices';
import { accessExtension } from '../../promo-codes';
import { SubscriptionAccessService, SubscriptionLinkService } from '../../subscription-link';
import { TelegramNotifyService } from '../../telegram/services/telegram-notify.service';

@Injectable()
export class AdminUserActionsService {
  private readonly logger = new Logger(AdminUserActionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly autoRenew: AutoRenewService,
    private readonly devices: DevicesService,
    private readonly access: SubscriptionAccessService,
    private readonly links: SubscriptionLinkService,
    private readonly notify: TelegramNotifyService
  ) {}

  async extend({ admin, userId, days }: ExtendActionInput): Promise<AdminExtendResult> {
    await this.emailOf(userId);

    const currentPeriodEnd = await withUniqueRetry(() =>
      withSerializableRetry(() =>
        this.prisma.$transaction((tx) => this.extendWithin({ userId, days, now: new Date(), db: tx }), { isolationLevel: 'Serializable' })
      )
    );

    await this.access.setEnabledAll({ userId, enabled: true }).catch((error: unknown) => {
      this.logger.error(`access for ${userId} was not re-enabled after an admin extension, the sweep will: ${describeError(error)}`);
    });

    this.logger.log(`admin ${admin.email} extended ${userId} by ${days} days to ${currentPeriodEnd.toISOString()}`);

    return adminExtendResultSchema.parse({ currentPeriodEnd: currentPeriodEnd.toISOString() });
  }

  async cancelAutoRenew({ admin, userId }: AdminActionInput): Promise<void> {
    await this.autoRenew.cancelAutoRenew(userId);

    this.logger.log(`admin ${admin.email} turned auto-renewal off for ${userId}`);
  }

  async removeDevice({ admin, userId, deviceId }: RemoveDeviceActionInput): Promise<void> {
    await this.devices.remove({ userId, deviceId });

    this.logger.log(`admin ${admin.email} removed device ${deviceId} of ${userId}`);
  }

  async message({ admin, userId, text }: MessageActionInput): Promise<AdminMessageResult> {
    await this.emailOf(userId);

    const outcome = await this.notify.message({ userId, text });

    this.logger.log(`admin ${admin.email} messaged ${userId} in telegram (${text.length} chars): ${outcome}`);

    return adminMessageResultSchema.parse({ outcome });
  }

  async verifyEmail({ admin, userId }: AdminActionInput): Promise<void> {
    const email = await this.emailOf(userId);

    if (isPlaceholderEmail(email)) {
      throw new AppBadRequestException('VALIDATION_FAILED', 'A Telegram account has no email to confirm');
    }

    await this.prisma.user.update({ where: { id: userId }, data: { emailVerified: true } });

    this.logger.log(`admin ${admin.email} marked the email of ${userId} as confirmed`);
  }

  async rotateLink({ admin, userId }: AdminActionInput): Promise<void> {
    await this.emailOf(userId);
    await this.links.rotate(userId);

    this.logger.log(`admin ${admin.email} rotated the subscription link of ${userId}`);
  }

  private async emailOf(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });

    if (isNullish(user)) {
      throw new AppNotFoundException('NOT_FOUND', 'No such user');
    }

    return user.email;
  }

  private async extendWithin({ userId, days, now, db }: ExtendWithinInput): Promise<Date> {
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
}
