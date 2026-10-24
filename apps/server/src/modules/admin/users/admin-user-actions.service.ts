import type { AdminExtendResult, AdminMessageResult } from '@gnomevpn/schemas';

import { adminExtendResultSchema, adminMessageResultSchema, DEFAULT_PLAN_ID, isPlaceholderEmail } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';

import { AppBadRequestException } from '@/common/exceptions';
import { accessExtension, describeError } from '@/common/lib';
import { PrismaService, withUniqueRetry } from '@/core';
import { AutoRenewService } from '@/modules/billing';
import { DevicesService } from '@/modules/devices';
import { SubscriptionAccessService, SubscriptionLinkService } from '@/modules/subscription-link';
import { TelegramNotifyService } from '@/modules/telegram/notify';

import type { AdminActionInput, ExtendActionInput, ExtendWithinInput, MessageActionInput, RemoveDeviceActionInput } from './users.types';

import { AdminAuditService } from '../shared/admin-audit.service';
import { ADMIN_ACTION } from '../shared/admin.config';

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

    await this.audit.record({
      admin,
      action: ADMIN_ACTION.extend,
      summary: `extended ${userId} by ${days} days to ${currentPeriodEnd.toISOString()}`,
      targetUserId: userId,
      details: { days, currentPeriodEnd: currentPeriodEnd.toISOString() }
    });

    return adminExtendResultSchema.parse({ currentPeriodEnd: currentPeriodEnd.toISOString() });
  }

  async cancelAutoRenew({ admin, userId }: AdminActionInput): Promise<void> {
    await this.autoRenew.cancelAutoRenew(userId);

    await this.audit.record({ admin, action: ADMIN_ACTION.cancelAutoRenew, summary: `turned auto-renewal off for ${userId}`, targetUserId: userId });
  }

  async removeDevice({ admin, userId, deviceId }: RemoveDeviceActionInput): Promise<void> {
    await this.devices.remove({ userId, deviceId });

    await this.audit.record({
      admin,
      action: ADMIN_ACTION.removeDevice,
      summary: `removed device ${deviceId} of ${userId}`,
      targetUserId: userId,
      details: { deviceId }
    });
  }

  async message({ admin, userId, text }: MessageActionInput): Promise<AdminMessageResult> {
    await this.emailOf(userId);

    const outcome = await this.notify.message({ userId, text });

    await this.audit.record({
      admin,
      action: ADMIN_ACTION.message,
      summary: `messaged ${userId} in telegram (${text.length} chars): ${outcome}`,
      targetUserId: userId,
      details: { length: text.length, outcome }
    });

    return adminMessageResultSchema.parse({ outcome });
  }

  async verifyEmail({ admin, userId }: AdminActionInput): Promise<void> {
    const email = await this.emailOf(userId);

    if (isPlaceholderEmail(email)) {
      throw new AppBadRequestException('VALIDATION_FAILED', 'A Telegram account has no email to confirm');
    }

    await this.prisma.user.update({ where: { id: userId }, data: { emailVerified: true } });

    await this.audit.record({ admin, action: ADMIN_ACTION.verifyEmail, summary: `marked the email of ${userId} as confirmed`, targetUserId: userId });
  }

  async rotateLink({ admin, userId }: AdminActionInput): Promise<void> {
    await this.emailOf(userId);
    await this.links.rotate(userId);

    await this.audit.record({ admin, action: ADMIN_ACTION.rotateLink, summary: `rotated the subscription link of ${userId}`, targetUserId: userId });
  }

  private async emailOf(userId: string): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true } });

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
