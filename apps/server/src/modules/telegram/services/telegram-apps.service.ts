import { Injectable } from '@nestjs/common';
import { InlineKeyboard } from 'grammy';
import { isNullish } from 'remeda';

import type { BotContext, ShowClientInput } from '../telegram.types';

import { SubscriptionService } from '../../subscription';
import { SubscriptionLinkService } from '../../subscription-link';
import { BOT_TEXT, CALLBACK_PREFIX, CLIENT_LIST, NEW_LINE } from '../config';
import {
  appsKeyboard,
  clientLabel,
  clientName,
  clientPaste,
  fillLabel,
  fillText,
  html,
  isButtonUrl,
  noAccessMessage,
  parseClientId,
  platformNames
} from '../lib';
import { TelegramSharedService } from './telegram-shared.service';

@Injectable()
export class TelegramAppsService {
  constructor(
    private readonly shared: TelegramSharedService,
    private readonly subscription: SubscriptionService,
    private readonly subscriptionLink: SubscriptionLinkService
  ) {}

  async list(ctx: BotContext): Promise<void> {
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

  async show(ctx: BotContext): Promise<void> {
    await this.shared.answered({
      ctx,
      prefix: CALLBACK_PREFIX.client,
      act: async ({ chat, value }) => {
        if (value === CLIENT_LIST) {
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
    const text = BOT_TEXT[chat.locale];
    const { clients } = await this.subscriptionLink.get(chat.userId);
    const client = clients.find((entry) => entry.id === id);

    if (isNullish(client)) {
      return;
    }

    const platforms = platformNames({ platforms: client.platforms, locale: chat.locale });
    const heading = [html.bold(clientName({ id, locale: chat.locale })), fillText({ text: text.appsPlatforms, fill: { platforms } })].join(NEW_LINE);
    const steps = fillText({ text: text.appsSteps, fill: { how: clientPaste({ id, locale: chat.locale }) } });
    const canLinkDownload = isButtonUrl(client.downloadUrl);
    const markup = new InlineKeyboard().copyText(text.appsCopyLink, client.copyUrl).primary().row();

    if (canLinkDownload) {
      markup.url(fillLabel({ text: text.appsDownload, fill: { name: clientLabel(id) } }), client.downloadUrl).row();
    }

    markup.text(text.appsBack, `${CALLBACK_PREFIX.client}${CLIENT_LIST}`);

    await this.shared.edit({ ctx, text: html.paragraphs([heading, steps, canLinkDownload ? null : html.escape(client.downloadUrl)]), markup });
  }
}
