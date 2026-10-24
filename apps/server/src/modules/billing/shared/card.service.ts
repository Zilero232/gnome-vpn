import type { BindCardResult } from '@gnomevpn/schemas';

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { isNullish } from 'remeda';

import { AppBadRequestException } from '@/common/exceptions';
import { AppConfigService } from '@/config';
import { PrismaService } from '@/core';
import { YooKassaClient } from '@/lib/yookassa';

import type { AttachCardInput } from './card.types';

@Injectable()
export class CardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly yookassa: YooKassaClient
  ) {}

  async bindCard(userId: string): Promise<BindCardResult> {
    if (!this.config.get('yookassa').isRecurringEnabled) {
      throw new AppBadRequestException('RECURRING_UNAVAILABLE', 'Recurring payments are not enabled for this shop');
    }

    const method = await this.yookassa.bindPaymentMethod({
      returnUrl: this.config.get('yookassa').returnUrl,
      idempotenceKey: randomUUID()
    });

    if (method.status === 'active') {
      await this.attach({ userId, paymentMethodId: method.id, title: method.title });

      return { confirmationUrl: null, isActive: true };
    }

    await this.prisma.subscription.update({
      where: { userId },
      data: { pendingCardId: method.id }
    });

    return { confirmationUrl: method.confirmationUrl, isActive: false };
  }

  async confirmPending(paymentMethodId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { pendingCardId: paymentMethodId },
      select: { userId: true }
    });

    if (isNullish(subscription)) {
      return;
    }

    const method = await this.yookassa.getPaymentMethod(paymentMethodId);

    if (method.status !== 'active') {
      await this.prisma.subscription.update({
        where: { userId: subscription.userId },
        data: { pendingCardId: null }
      });

      return;
    }

    await this.attach({ userId: subscription.userId, paymentMethodId, title: method.title });
  }

  async unbindCard(userId: string): Promise<void> {
    await this.prisma.subscription.update({
      where: { userId },
      data: {
        savedCardId: null,
        savedCardTitle: null,
        pendingCardId: null,
        cancelAtPeriodEnd: true
      }
    });
  }

  private async attach({ userId, paymentMethodId, title }: AttachCardInput): Promise<void> {
    await this.prisma.subscription.update({
      where: { userId },
      data: {
        savedCardId: paymentMethodId,
        savedCardTitle: title,
        pendingCardId: null,
        cancelAtPeriodEnd: false
      }
    });
  }
}
