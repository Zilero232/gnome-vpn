import type { Context } from 'grammy';

import { Injectable } from '@nestjs/common';
import { isNullish } from 'remeda';

import { errorCodeOf } from '@/common/lib';
import { AutoRenewService } from '@/modules/billing';
import { SubscriptionService } from '@/modules/subscription';
import { SubscriptionLinkService } from '@/modules/subscription-link';

import { BOT_TEXT, CALLBACK_PREFIX, CALLBACK_VALUE } from '../config';
import { autoRenewChoice } from '../shared/callback-data';
import { rotateCopy } from '../shared/keyboard';
import { TelegramSharedService } from '../shared/telegram-shared.service';
import { autoRenewPanel, linkMessage } from './subscription-view';

@Injectable()
export class TelegramBillingService {
  constructor(
    private readonly shared: TelegramSharedService,
    private readonly subscription: SubscriptionService,
    private readonly subscriptionLink: SubscriptionLinkService,
    private readonly autoRenewal: AutoRenewService
  ) {}

  async askRotate(ctx: Context): Promise<void> {
    await this.shared.ask({ ctx, prefix: CALLBACK_PREFIX.rotate, pick: rotateCopy });
  }

  async confirmRotate(ctx: Context): Promise<void> {
    await this.shared.confirmed({
      ctx,
      prefix: CALLBACK_PREFIX.rotate,
      cancelled: (copy) => copy.rotateCancelled,
      act: async (chat) => {
        const { url } = await this.subscriptionLink.rotate(chat.userId);

        return this.shared.reply({ ctx, chat, ...linkMessage({ locale: chat.locale, intro: BOT_TEXT[chat.locale].rotateDone, url }) });
      }
    });
  }

  async autoRenew(ctx: Context): Promise<void> {
    await this.shared.withUser({
      ctx,
      act: async (chat) => {
        const status = await this.subscription.getStatus(chat.userId);

        return this.shared.reply({ ctx, chat, ...autoRenewPanel({ status, locale: chat.locale }) });
      }
    });
  }

  async changeAutoRenew(ctx: Context): Promise<void> {
    await this.shared.answered({
      ctx,
      prefix: CALLBACK_PREFIX.autoRenew,
      act: async ({ chat, value }) => {
        const choice = autoRenewChoice(value);

        if (isNullish(choice)) {
          return;
        }

        try {
          await (choice === CALLBACK_VALUE.switch.on ? this.autoRenewal.resumeAutoRenew(chat.userId) : this.autoRenewal.cancelAutoRenew(chat.userId));
        } catch (error) {
          if (errorCodeOf(error) !== 'PAYMENT_METHOD_MISSING') {
            throw error;
          }
        }

        const status = await this.subscription.getStatus(chat.userId);

        return this.shared.edit({ ctx, ...autoRenewPanel({ status, locale: chat.locale }) });
      }
    });
  }
}
