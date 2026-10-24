import type { Context } from 'grammy';

import { Injectable } from '@nestjs/common';
import { isNonNullish, isNullish } from 'remeda';

import { errorCodeOf } from '@/common/lib';
import { AccountService, IdentityService } from '@/modules/auth';

import type { BotMessage } from '../telegram.types';

import { BOT_TEXT, CALLBACK_PREFIX } from '../config';
import { TelegramChatsService, TelegramNotifyService } from '../notify';
import { deleteCopy, languageKeyboard, menuButtons, moreKeyboard, unlinkCopy, urlMessage } from '../shared/keyboard';
import { TelegramSharedService } from '../shared/telegram-shared.service';
import { fillText, html, resolveLocale } from '../shared/text';
import { botBlockChange, botUrl, isGroupJoin } from '../shared/update';
import { TelegramLinkService } from './telegram-link.service';
import { TelegramWebLoginService } from './telegram-web-login.service';

@Injectable()
export class TelegramAccountService {
  constructor(
    private readonly shared: TelegramSharedService,
    private readonly link: TelegramLinkService,
    private readonly chats: TelegramChatsService,
    private readonly identity: IdentityService,
    private readonly webLogin: TelegramWebLoginService,
    private readonly account: AccountService,
    private readonly notify: TelegramNotifyService
  ) {}

  async help(ctx: Context): Promise<void> {
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

  async chatId(ctx: Context): Promise<void> {
    if (isNullish(ctx.chat)) {
      return;
    }

    await ctx.reply(fillText({ text: this.shared.textFor(ctx).chatId, fill: { id: String(ctx.chat.id) } }));
  }

  async groupOnly(ctx: Context): Promise<void> {
    const text = this.shared.textFor(ctx);
    const url = botUrl(ctx.me.username);
    const message: BotMessage = isNullish(url)
      ? { text: text.groupOnly }
      : urlMessage({ intro: text.groupOnly, url, label: text.groupOpen, style: 'primary' });

    await ctx.reply(message.text, { reply_markup: message.markup });
  }

  async joined(ctx: Context): Promise<void> {
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
      await this.chats.setBlocked({ telegramId: BigInt(update.chat.id), blockedAt: change === 'blocked' ? new Date() : null });
    }
  }

  async more(ctx: Context): Promise<void> {
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

  async openWebsite(ctx: Context): Promise<void> {
    await this.shared.withUser({
      ctx,
      act: async (chat) => {
        const text = BOT_TEXT[chat.locale];
        const url = await this.webLogin.issue(chat.userId);

        return this.shared.reply({ ctx, chat, ...urlMessage({ intro: text.websiteIntro, url, label: text.openSite, style: 'primary' }) });
      }
    });
  }

  async askUnlink(ctx: Context): Promise<void> {
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

  async askDelete(ctx: Context): Promise<void> {
    await this.shared.ask({ ctx, prefix: CALLBACK_PREFIX.deleteAccount, pick: deleteCopy });
  }

  async confirmDelete(ctx: Context): Promise<void> {
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

  async confirmUnlink(ctx: Context): Promise<void> {
    await this.shared.confirmed({
      ctx,
      prefix: CALLBACK_PREFIX.unlink,
      cancelled: (copy) => copy.unlinkCancelled,
      act: (chat) => this.link.unlink(chat.userId)
    });
  }

  async chooseLanguage(ctx: Context): Promise<void> {
    const { chat, copy } = await this.shared.copyFor(ctx);

    await ctx.reply(copy.chooseLanguage, { reply_markup: languageKeyboard(chat?.locale) });
  }

  async changeLocale(ctx: Context): Promise<void> {
    await this.shared.answered({
      ctx,
      prefix: CALLBACK_PREFIX.locale,
      act: async ({ chat, value }) => {
        const locale = resolveLocale(value);

        await Promise.all([this.chats.setLocale({ telegramId: chat.telegramId, locale }), this.shared.settle(ctx)]);

        return this.shared.reply({ ctx, chat: { ...chat, locale }, text: BOT_TEXT[locale].languageChanged });
      }
    });
  }
}
