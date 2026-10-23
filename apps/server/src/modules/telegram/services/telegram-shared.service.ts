import { Injectable, Logger } from '@nestjs/common';
import { GrammyError } from 'grammy';
import { isNullish } from 'remeda';

import type {
  AcknowledgeInput,
  AnsweredInput,
  AskInput,
  AttemptInput,
  BotContext,
  BotLocale,
  BotText,
  ChatCopy,
  ConfirmedInput,
  EditInput,
  ReplyInput,
  WithUserInput
} from '../telegram.types';

import { describeError } from '../../../common/lib';
import { AppConfigService } from '../../../config';
import { localizedPath } from '../../../lib/email';
import { BOT_TEXT, CHECKOUT, EDIT } from '../config';
import { adminChatOf, botUrl, confirmKeyboard, identityOf, isAdminChat, isConfirmed, mainKeyboard, resolveLocale } from '../lib';
import { TelegramLinkService } from './telegram-link.service';
import { TelegramNotifyService } from './telegram-notify.service';
import { TelegramThrottleService } from './telegram-throttle.service';

@Injectable()
export class TelegramSharedService {
  private readonly logger = new Logger(TelegramSharedService.name);

  constructor(
    private readonly link: TelegramLinkService,
    private readonly notify: TelegramNotifyService,
    private readonly config: AppConfigService,
    private readonly throttle: TelegramThrottleService
  ) {}

  returnUrl(): string | undefined {
    return botUrl(this.config.get('TELEGRAM_BOT_USERNAME'));
  }

  termsUrl(locale: BotLocale): string {
    return new URL(localizedPath({ path: CHECKOUT.termsPath, locale }), this.config.get('CLIENT_URL')).toString();
  }

  textFor(ctx: BotContext): BotText {
    return BOT_TEXT[resolveLocale(ctx.from?.language_code)];
  }

  async copyFor(ctx: BotContext): Promise<ChatCopy> {
    const identity = identityOf(ctx.from);
    const chat = isNullish(identity) ? null : await this.link.findChat(identity.telegramId);

    return { chat, copy: chat ? BOT_TEXT[chat.locale] : this.textFor(ctx) };
  }

  adminChatId(): number | null {
    return adminChatOf(this.config.get('TELEGRAM_ADMIN_CHAT_ID'));
  }

  isAdminChat(ctx: BotContext): boolean {
    return isAdminChat({ chatId: ctx.chat?.id, adminChatId: this.adminChatId() });
  }

  async reply({ ctx, chat, text, markup, effect }: ReplyInput): Promise<void> {
    const keyboard = markup ?? (chat ? mainKeyboard({ locale: chat.locale, state: await this.notify.stateOf(chat.userId) }) : undefined);

    await ctx.reply(text, { reply_markup: keyboard, message_effect_id: effect });
  }

  async edit({ ctx, text, markup }: EditInput): Promise<void> {
    if (isNullish(ctx.callbackQuery?.message)) {
      await ctx.reply(text, { reply_markup: markup });

      return;
    }

    try {
      await ctx.editMessageText(text, { reply_markup: markup });
    } catch (error) {
      if (!(error instanceof GrammyError)) {
        throw error;
      }

      if (EDIT.unchanged.test(error.description)) {
        return;
      }

      if (!EDIT.uneditable.test(error.description)) {
        throw error;
      }

      await ctx.reply(text, { reply_markup: markup });
    }
  }

  async settle(ctx: BotContext): Promise<void> {
    await ctx.editMessageReplyMarkup({ reply_markup: undefined }).catch((error: unknown) => {
      this.logger.debug(`could not clear telegram buttons: ${describeError(error)}`);
    });
  }

  typing(ctx: BotContext): void {
    ctx.replyWithChatAction('typing').catch((error: unknown) => {
      this.logger.debug(`could not show telegram typing: ${describeError(error)}`);
    });
  }

  async acknowledge({ ctx, text }: AcknowledgeInput): Promise<void> {
    await ctx.answerCallbackQuery(text).catch((error: unknown) => {
      this.logger.debug(`could not answer a telegram button press: ${describeError(error)}`);
    });
  }

  async notLinked(ctx: BotContext): Promise<void> {
    await ctx.reply(this.textFor(ctx).notLinked, { reply_markup: { remove_keyboard: true } });
  }

  async claimCheckout(ctx: BotContext): Promise<boolean> {
    return isNullish(ctx.from) || this.throttle.allow({ throttle: 'checkout', key: String(ctx.from.id) });
  }

  async answered({ ctx, prefix, act }: AnsweredInput): Promise<void> {
    const identity = identityOf(ctx.from);
    const data = ctx.callbackQuery?.data;

    if (isNullish(identity) || isNullish(data)) {
      return;
    }

    await this.acknowledge({ ctx });

    const chat = await this.link.findChat(identity.telegramId);

    if (isNullish(chat)) {
      await this.notLinked(ctx);

      return;
    }

    await this.attempt({ ctx, chat, act: () => act({ chat, value: data.slice(prefix.length) }) });
  }

  async ask({ ctx, prefix, pick }: AskInput): Promise<void> {
    await this.withUser({
      ctx,
      act: ({ locale }) => {
        const copy = pick(BOT_TEXT[locale]);

        return ctx.reply(copy.ask, { reply_markup: confirmKeyboard({ copy, prefix }) });
      }
    });
  }

  async confirmed({ ctx, prefix, cancelled, act }: ConfirmedInput): Promise<void> {
    await this.answered({
      ctx,
      prefix,
      act: async ({ chat, value }) => {
        if (!isConfirmed(value)) {
          return this.edit({ ctx, text: cancelled(BOT_TEXT[chat.locale]) });
        }

        return Promise.all([this.settle(ctx), act(chat)]);
      }
    });
  }

  async withUser({ ctx, act }: WithUserInput): Promise<void> {
    const identity = identityOf(ctx.from);

    if (isNullish(identity)) {
      return;
    }

    const chat = await this.link.findChat(identity.telegramId);

    if (isNullish(chat)) {
      await this.notLinked(ctx);

      return;
    }

    this.link.touch(identity).catch((error: unknown) => {
      this.logger.debug(`could not record telegram activity: ${describeError(error)}`);
    });

    await this.attempt({ ctx, chat, act: () => act(chat) });
  }

  private async attempt({ ctx, chat, act }: AttemptInput): Promise<void> {
    try {
      await act();
    } catch (error) {
      this.logger.warn(`telegram handler failed: ${describeError(error)}`);

      await ctx.reply(BOT_TEXT[chat.locale].failed);
    }
  }
}
