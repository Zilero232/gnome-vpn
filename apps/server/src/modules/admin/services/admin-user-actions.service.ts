import type { AdminExtendResult, AdminMessageResult } from '@gnomevpn/schemas';

import { adminExtendResultSchema, adminMessageResultSchema, DEFAULT_PLAN_ID, isPlaceholderEmail } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isNullish } from 'remeda';

import { AppBadRequestException, AppNotFoundException } from '@/common/exceptions';
import { accessExtension, describeError } from '@/common/lib';
import { PrismaService, withUniqueRetry } from '@/core';
import { AutoRenewService } from '@/modules/billing';
import { DevicesService } from '@/modules/devices';
import { SubscriptionAccessService, SubscriptionLinkService } from '@/modules/subscription-link';
import { TelegramNotifyService } from '@/modules/telegram/services/telegram-notify.service';

import type { AdminActionInput, ExtendActionInput, ExtendWithinInput, MessageActionInput, RemoveDeviceActionInput } from '../admin.types';

import { ADMIN_ACTION } from '../config';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminUserActionsService {
  private readonly logger = new Logger(AdminUserActionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly autoRenew: AutoRenewService,
    private readonly devices: DevicesService,
    private readonly access: SubscriptionAccessService,
    private readonly links: SubscriptionLinkService,
    private readonly notify: TelegramNotifyService,
    private readonly audit: AdminAuditService
  ) {}

  async extend({ admin, userId, days }: ExtendActionInput): Promise<AdminExtendResult> {
    await this.emailOf(userId);

    const currentPeriodEnd = await withUniqueRetry(() =>
      this.prisma.serializable((tx) => this.extendWithin({ userId, days, now: new Date(), db: tx }))
    );

    await this.access.setEnabledAll({ userId, enabled: true }).catch((error: unknown) => {
      this.logger.error(`access for ${userId} was not re-enabled after an admin extension, the sweep will: ${describeError(error)}`);
    });

    this.logger.log(`admin ${admin.email} extended ${userId} by ${days} days to ${currentPeriodEnd.toISOString()}`);

    await this.audit.record({
      admin,
      action: ADMIN_ACTION.extend,
      targetUserId: userId,
      details: { days, currentPeriodEnd: currentPeriodEnd.toISOString() }
    });

    return adminExtendResultSchema.parse({ currentPeriodEnd: currentPeriodEnd.toISOString() });
  }

  async cancelAutoRenew({ admin, userId }: AdminActionInput): Promise<void> {
    await this.autoRenew.cancelAutoRenew(userId);

    this.logger.log(`admin ${admin.email} turned auto-renewal off for ${userId}`);

    await this.audit.record({ admin, action: ADMIN_ACTION.cancelAutoRenew, targetUserId: userId });
  }

  async removeDevice({ admin, userId, deviceId }: RemoveDeviceActionInput): Promise<void> {
    await this.devices.remove({ userId, deviceId });

    this.logger.log(`admin ${admin.email} removed device ${deviceId} of ${userId}`);

    await this.audit.record({ admin, action: ADMIN_ACTION.removeDevice, targetUserId: userId, details: { deviceId } });
  }

  async message({ admin, userId, text }: MessageActionInput): Promise<AdminMessageResult> {
    await this.emailOf(userId);

    const outcome = await this.notify.message({ userId, text });

    this.logger.log(`admin ${admin.email} messaged ${userId} in telegram (${text.length} chars): ${outcome}`);

    await this.audit.record({ admin, action: ADMIN_ACTION.message, targetUserId: userId, details: { length: text.length, outcome } });

    return adminMessageResultSchema.parse({ outcome });
  }

  async verifyEmail({ admin, userId }: AdminActionInput): Promise<void> {
    const email = await this.emailOf(userId);

    if (isPlaceholderEmail(email)) {
      throw new AppBadRequestException('VALIDATION_FAILED', 'A Telegram account has no email to confirm');
    }

    await this.prisma.user.update({ where: { id: userId }, data: { emailVerified: true } });

    this.logger.log(`admin ${admin.email} marked the email of ${userId} as confirmed`);

    await this.audit.record({ admin, action: ADMIN_ACTION.verifyEmail, targetUserId: userId });
  }

  async rotateLink({ admin, userId }: AdminActionInput): Promise<void> {
    await this.emailOf(userId);
    await this.links.rotate(userId);

    this.logger.log(`admin ${admin.email} rotated the subscription link of ${userId}`);

    await this.audit.record({ admin, action: ADMIN_ACTION.rotateLink, targetUserId: userId });
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
