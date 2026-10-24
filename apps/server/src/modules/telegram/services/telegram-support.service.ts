import { DEFAULT_PLAN_ID } from '@gnomevpn/schemas';
import { TTLCache } from '@isaacs/ttlcache';
import { Injectable, Logger } from '@nestjs/common';
import { isEmpty, isNonNullish, isNullish } from 'remeda';

import { describeError } from '@/common/lib';
import { AppConfigService } from '@/config';
import { PrismaService } from '@/core';
import { periodKind } from '@/modules/subscription';

import type { SupportAccount } from '../lib';
import type { BotContext, RememberThreadInput, ResolvedChat, SupportAnswerInput, SupportDeliverInput, SupportThreadInput } from '../telegram.types';

import { BOT_TEXT, DEFAULT_BOT_LOCALE, SUPPORT } from '../config';
import { deliveryOutcome, migratedChatId, resolveLocale, supportHeader, urlMessage } from '../lib';
import { TelegramLinkService } from './telegram-link.service';
import { TelegramSharedService } from './telegram-shared.service';
import { TelegramThrottleService } from './telegram-throttle.service';

@Injectable()
export class TelegramSupportService {
  private readonly logger = new Logger(TelegramSupportService.name);
  private readonly threads = new TTLCache<string, Promise<number>>({ ttl: SUPPORT.threadWindowMs, checkAgeOnGet: true });

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly shared: TelegramSharedService,
    private readonly link: TelegramLinkService,
    private readonly throttle: TelegramThrottleService
  ) {}

  accepts(ctx: BotContext): boolean {
    return !isNullish(this.shared.adminChatId()) && !this.shared.isAdminChat(ctx);
  }

  async open(ctx: BotContext): Promise<void> {
    const { chat, copy } = await this.shared.copyFor(ctx);

    if (!isNullish(this.shared.adminChatId())) {
      await this.shared.reply({ ctx, chat, text: copy.supportIntro });

      return;
    }

    const supportUrl = this.config.get('app').supportUrl;
    const message = isEmpty(supportUrl)
      ? urlMessage({ intro: copy.supportOfflineSite, url: this.config.get('app').clientUrl, label: copy.supportSite, style: 'primary' })
      : urlMessage({ intro: copy.supportOffline, url: supportUrl, label: copy.supportWrite, style: 'primary' });

    await this.shared.reply({ ctx, chat, ...message });
  }

  async relay(ctx: BotContext): Promise<void> {
    const adminChatId = this.shared.adminChatId();
    const message = ctx.message;
    const sender = ctx.from;

    if (isNullish(adminChatId) || isNullish(message) || isNullish(sender) || !this.accepts(ctx)) {
      return;
    }

    const key = String(sender.id);
    const { chat, copy } = await this.shared.copyFor(ctx);

    if (!(await this.throttle.allow({ throttle: 'supportRate', key }))) {
      if (await this.throttle.allow({ throttle: 'supportSlowDown', key })) {
        await ctx.reply(copy.supportSlowDown);
      }

      return;
    }

    try {
      const header = await this.threadFor({ ctx, sender, adminChatId, chat });
      const copied = await ctx.api.copyMessage(adminChatId, message.chat.id, message.message_id, {
        reply_parameters: { message_id: header, allow_sending_without_reply: true }
      });

      await this.remember({ adminChatId, messageId: copied.message_id, telegramId: message.chat.id, locale: resolveLocale(sender.language_code) });
    } catch (error) {
      const migrated = migratedChatId(error);

      if (isNonNullish(migrated)) {
        this.logger.error(`the admin chat became a supergroup — set TELEGRAM_ADMIN_CHAT_ID=${migrated} and restart the server`);
      }

      this.logger.warn(`a support message from ${key} was not passed on: ${describeError(error)}`);

      await ctx.reply(copy.failed);

      return;
    }

    if (await this.throttle.allow({ throttle: 'supportAck', key })) {
      await ctx.reply(copy.supportAck);
    }
  }

  async answer({ ctx, next }: SupportAnswerInput): Promise<void> {
    const adminChatId = this.shared.adminChatId();
    const message = ctx.message;
    const replied = message?.reply_to_message;

    if (isNullish(adminChatId) || isNullish(message) || isNullish(replied)) {
      return next();
    }

    const thread = await this.prisma.telegramSupportMessage.findUnique({
      where: { adminChatId_adminMessageId: { adminChatId: BigInt(adminChatId), adminMessageId: replied.message_id } },
      select: { telegramId: true, locale: true }
    });

    if (isNullish(thread)) {
      return next();
    }

    const copy = this.shared.textFor(ctx);

    try {
      await this.deliver({
        ctx,
        message,
        telegramId: thread.telegramId,
        locale: isNullish(thread.locale) ? DEFAULT_BOT_LOCALE : resolveLocale(thread.locale)
      });
    } catch (error) {
      this.logger.warn(`a support answer to ${thread.telegramId} was not delivered: ${describeError(error)}`);

      const refusal = deliveryOutcome(error).kind === 'blocked' ? copy.supportAnswerBlocked : copy.supportAnswerFailed;

      await ctx.reply(refusal, { reply_parameters: { message_id: message.message_id } });

      return;
    }

    await ctx.api
      .setMessageReaction(message.chat.id, message.message_id, [{ type: 'emoji', emoji: SUPPORT.answeredReaction }])
      .catch((error: unknown) => {
        this.logger.debug(`could not mark a support answer as delivered: ${describeError(error)}`);
      });
  }

  private async deliver({ ctx, message, telegramId, locale }: SupportDeliverInput): Promise<void> {
    const chatId = Number(telegramId);

    if (await this.throttle.allow({ throttle: 'supportAnswerTitle', key: String(telegramId) })) {
      const chat = await this.link.findChat(telegramId);

      await ctx.api.sendMessage(chatId, BOT_TEXT[chat?.locale ?? locale].supportAnswerTitle);
    }

    await ctx.api.copyMessage(chatId, message.chat.id, message.message_id);
  }

  private threadFor(input: SupportThreadInput): Promise<number> {
    const key = String(input.sender.id);
    const cached = this.threads.get(key);

    if (isNonNullish(cached)) {
      return cached;
    }

    const header = this.postHeader(input);

    this.threads.set(key, header);

    header.catch(() => {
      this.threads.delete(key);
    });

    return header;
  }

  private async postHeader({ ctx, sender, adminChatId, chat }: SupportThreadInput): Promise<number> {
    const account = isNullish(chat) ? null : await this.accountOf(chat);
    const sent = await ctx.api.sendMessage(adminChatId, supportHeader({ sender, account, locale: DEFAULT_BOT_LOCALE }));

    await this.remember({ adminChatId, messageId: sent.message_id, telegramId: sender.id, locale: resolveLocale(sender.language_code) });

    return sent.message_id;
  }

  private async accountOf({ userId, locale }: ResolvedChat): Promise<SupportAccount | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        subscription: { select: { plan: true, currentPeriodEnd: true, trialStartedAt: true } },
        _count: { select: { devices: true } }
      }
    });

    if (isNullish(user)) {
      return null;
    }

    return {
      email: user.email,
      locale,
      deviceCount: user._count.devices,
      period: periodKind(user.subscription),
      plan: user.subscription?.plan ?? DEFAULT_PLAN_ID,
      currentPeriodEnd: user.subscription?.currentPeriodEnd ?? null
    };
  }

  private async remember({ adminChatId, messageId, telegramId, locale }: RememberThreadInput): Promise<void> {
    await this.prisma.telegramSupportMessage
      .create({ data: { adminChatId: BigInt(adminChatId), adminMessageId: messageId, telegramId: BigInt(telegramId), locale } })
      .catch((error: unknown) => {
        this.logger.warn(`a support message was posted but not remembered, a reply to it will not reach ${telegramId}: ${describeError(error)}`);
      });
  }
}
