import { Injectable, Logger } from '@nestjs/common';
import { isNonNullish, isNullish } from 'remeda';

import { describeError, errorCodeOf } from '@/common/lib';
import { AppConfigService } from '@/config';
import { AccountService, IdentityService } from '@/modules/auth';

import type { BotContext, BotLocale, BotMessage, ConsumeInput, GreetInput, WelcomeInput } from '../telegram.types';

import { BOT_TEXT, CALLBACK_PREFIX, DEFAULT_BOT_LOCALE, MESSAGE_EFFECT } from '../config';
import {
  botBlockChange,
  botUrl,
  deleteCopy,
  fillText,
  html,
  identityOf,
  isGroupJoin,
  languageKeyboard,
  menuButtons,
  moreKeyboard,
  refusalText,
  resolveLocale,
  unlinkCopy,
  urlMessage
} from '../lib';
import { TelegramLinkService } from './telegram-link.service';
import { TelegramNotifyService } from './telegram-notify.service';
import { TelegramSharedService } from './telegram-shared.service';
import { TelegramWebLoginService } from './telegram-web-login.service';

@Injectable()
export class TelegramAccountService {
  private readonly logger = new Logger(TelegramAccountService.name);

  constructor(
    private readonly shared: TelegramSharedService,
    private readonly link: TelegramLinkService,
    private readonly identity: IdentityService,
    private readonly webLogin: TelegramWebLoginService,
    private readonly config: AppConfigService,
    private readonly account: AccountService,
    private readonly notify: TelegramNotifyService
  ) {}

  async welcome({ ctx, note }: WelcomeInput): Promise<void> {
    const identity = identityOf(ctx.from);

    if (isNullish(identity)) {
      return;
    }

    const chat = await this.link.ensureChat(identity);

    await this.greet({ ctx, chat, note });
  }

  async greet({ ctx, chat, note }: GreetInput): Promise<void> {
    const greeting = chat.isNew ? this.startText(chat.locale) : BOT_TEXT[chat.locale].welcomeBack;

    await this.shared.reply({ ctx, chat, text: html.paragraphs([greeting, note]) });
  }

  async help(ctx: BotContext): Promise<void> {
    const { chat, copy } = await this.shared.copyFor(ctx);

    if (isNullish(chat)) {
      await this.shared.notLinked(ctx);

      return;
    }

    const support = isNullish(this.shared.adminChatId()) ? copy.helpSupportOffline : copy.helpSupport;

    await this.shared.reply({
      ctx,
      chat,
      text: html.paragraphs([copy.help, support]),
      markup: menuButtons({ locale: chat.locale, keys: ['support'] })
    });
  }

  async chatId(ctx: BotContext): Promise<void> {
    if (isNullish(ctx.chat)) {
      return;
    }

    await ctx.reply(fillText({ text: this.shared.textFor(ctx).chatId, fill: { id: String(ctx.chat.id) } }));
  }

  async groupOnly(ctx: BotContext): Promise<void> {
    const text = this.shared.textFor(ctx);
    const url = botUrl(ctx.me.username);
    const message: BotMessage = isNullish(url)
      ? { text: text.groupOnly }
      : urlMessage({ intro: text.groupOnly, url, label: text.groupOpen, style: 'primary' });

    await ctx.reply(message.text, { reply_markup: message.markup });
  }

  async joined(ctx: BotContext): Promise<void> {
    const update = ctx.myChatMember;

    if (isNullish(update)) {
      return;
    }

    if (isGroupJoin(update)) {
      await this.groupOnly(ctx);

      return;
    }

    const change = botBlockChange(update);

    if (isNonNullish(change)) {
      await this.link.setBlocked({ telegramId: BigInt(update.chat.id), blockedAt: change === 'blocked' ? new Date() : null });
    }
  }

  async more(ctx: BotContext): Promise<void> {
    await this.shared.withUser({
      ctx,
      act: async (chat) => {
        const state = await this.notify.stateOf(chat.userId);

        const text = BOT_TEXT[chat.locale];

        return this.shared.reply({
          ctx,
          chat,
          text: state.isSubscribed ? text.moreTitle : text.moreTitleNoAccess,
          markup: moreKeyboard({ locale: chat.locale, state })
        });
      }
    });
  }

  async openWebsite(ctx: BotContext): Promise<void> {
    await this.shared.withUser({
      ctx,
      act: async (chat) => {
        const text = BOT_TEXT[chat.locale];
        const url = await this.webLogin.issue(chat.userId);

        return this.shared.reply({ ctx, chat, ...urlMessage({ intro: text.websiteIntro, url, label: text.openSite, style: 'primary' }) });
      }
    });
  }

  async askUnlink(ctx: BotContext): Promise<void> {
    await this.shared.withUser({
      ctx,
      act: async (chat) => {
        if (await this.identity.hasRealEmail(chat.userId)) {
          return this.shared.ask({ ctx, prefix: CALLBACK_PREFIX.unlink, pick: unlinkCopy });
        }

        return this.shared.reply({ ctx, chat, text: BOT_TEXT[chat.locale].unlinkNoEmail });
      }
    });
  }

  async askDelete(ctx: BotContext): Promise<void> {
    await this.shared.ask({ ctx, prefix: CALLBACK_PREFIX.deleteAccount, pick: deleteCopy });
  }

  async confirmDelete(ctx: BotContext): Promise<void> {
    await this.shared.confirmed({
      ctx,
      prefix: CALLBACK_PREFIX.deleteAccount,
      cancelled: (copy) => copy.deleteCancelled,
      act: async (chat) => {
        try {
          await this.account.remove(chat.userId);
        } catch (error) {
          if (errorCodeOf(error) === 'ACCOUNT_PAYMENT_PENDING') {
            return this.shared.reply({ ctx, chat, text: BOT_TEXT[chat.locale].deletePaymentPending });
          }

          throw error;
        }

        return ctx.reply(BOT_TEXT[chat.locale].deleted, { reply_markup: { remove_keyboard: true } });
      }
    });
  }

  async confirmUnlink(ctx: BotContext): Promise<void> {
    await this.shared.confirmed({
      ctx,
      prefix: CALLBACK_PREFIX.unlink,
      cancelled: (copy) => copy.unlinkCancelled,
      act: (chat) => this.link.unlink(chat.userId)
    });
  }

  async chooseLanguage(ctx: BotContext): Promise<void> {
    const { chat, copy } = await this.shared.copyFor(ctx);

    await ctx.reply(copy.chooseLanguage, { reply_markup: languageKeyboard(chat?.locale) });
  }

  async changeLocale(ctx: BotContext): Promise<void> {
    await this.shared.answered({
      ctx,
      prefix: CALLBACK_PREFIX.locale,
      act: async ({ chat, value }) => {
        const locale = resolveLocale(value);

        await Promise.all([this.link.setLocale({ telegramId: chat.telegramId, locale }), this.shared.settle(ctx)]);

        return this.shared.reply({ ctx, chat: { ...chat, locale }, text: BOT_TEXT[locale].languageChanged });
      }
    });
  }

  async consume({ ctx, text }: ConsumeInput): Promise<void> {
    const identity = identityOf(ctx.from);

    if (isNullish(identity)) {
      return;
    }

    const known = await this.link.findChat(identity.telegramId);
    const copy = isNonNullish(known) ? BOT_TEXT[known.locale] : this.shared.textFor(ctx);

    try {
      await this.link.consumeCode({ code: text, ...identity });
    } catch (error) {
      const text = refusalText({
        error,
        copies: { TELEGRAM_ALREADY_LINKED: copy.alreadyLinked, TELEGRAM_CODE_INVALID: copy.codeInvalid },
        fallback: copy.failed,
        onUnknown: (reason) => this.logger.warn(`telegram link failed: ${describeError(reason)}`)
      });

      await this.shared.reply({ ctx, chat: known, text });

      return;
    }

    const chat = await this.link.findChat(identity.telegramId);
    const locale = chat?.locale ?? DEFAULT_BOT_LOCALE;

    await this.shared.reply({ ctx, chat, text: BOT_TEXT[locale].linked, effect: MESSAGE_EFFECT.celebrate });
  }

  private startText(locale: BotLocale): string {
    const text = BOT_TEXT[locale];

    return html.paragraphs([
      fillText({ text: text.start, fill: { site: this.config.get('CLIENT_URL') } }),
      fillText({ text: text.consentLine, fill: { link: this.shared.consentUrl(locale) } })
    ]);
  }
}
