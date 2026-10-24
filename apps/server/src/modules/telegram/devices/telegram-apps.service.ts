import type { Context } from 'grammy';

import { Injectable } from '@nestjs/common';
import { isNullish } from 'remeda';

import { SubscriptionService } from '@/modules/subscription';
import { SubscriptionLinkService } from '@/modules/subscription-link';

import type { ShowClientInput } from './devices.types';

import { BOT_TEXT, CALLBACK_PREFIX, CALLBACK_VALUE } from '../config';
import { parseClientId } from '../shared/callback-data';
import { noAccessMessage } from '../shared/keyboard';
import { TelegramSharedService } from '../shared/telegram-shared.service';
import { appsKeyboard, clientView } from './device-view';

@Injectable()
export class TelegramAppsService {
  constructor(
    private readonly shared: TelegramSharedService,
    private readonly subscription: SubscriptionService,
    private readonly subscriptionLink: SubscriptionLinkService
  ) {}

  async list(ctx: Context): Promise<void> {
    await this.shared.withUser({
      ctx,
      act: async (chat) => {
        const status = await this.subscription.getStatus(chat.userId);

        if (status.period === 'none') {
          return this.shared.reply({ ctx, chat, ...noAccessMessage({ status, locale: chat.locale }) });
        }

        return this.shared.reply({ ctx, chat, text: BOT_TEXT[chat.locale].appsIntro, markup: appsKeyboard(chat.locale) });
      }
    });
  }

  async show(ctx: Context): Promise<void> {
    await this.shared.answered({
      ctx,
      prefix: CALLBACK_PREFIX.client,
      act: async ({ chat, value }) => {
        if (value === CALLBACK_VALUE.clientList) {
          return this.shared.edit({ ctx, text: BOT_TEXT[chat.locale].appsIntro, markup: appsKeyboard(chat.locale) });
        }

        const id = parseClientId(value);

        if (isNullish(id)) {
          return;
        }

        await this.describe({ ctx, chat, id });
      }
    });
  }

  private async describe({ ctx, chat, id }: ShowClientInput): Promise<void> {
    const { clients } = await this.subscriptionLink.get(chat.userId);
    const client = clients.find((entry) => entry.id === id);

    if (isNullish(client)) {
      return;
    }

    await this.shared.edit({ ctx, ...clientView({ client, locale: chat.locale }) });
  }
}
