import { Injectable, Logger } from '@nestjs/common';
import { milliseconds } from 'date-fns';
import { setTimeout as sleep } from 'node:timers/promises';
import { isNullish } from 'remeda';

import type { BroadcastAudience, BroadcastTally } from '../lib';
import type { BotContext, BroadcastDelivery, BroadcastRunInput, BroadcastSendInput } from '../telegram.types';

import { describeError, isPeriodActive } from '../../../common/lib';
import { PrismaService } from '../../../core';
import { BOT_TEXT, BROADCAST, CALLBACK_PREFIX } from '../config';
import {
  audienceKeyboard,
  audienceOf,
  broadcastAnswer,
  broadcastChoice,
  broadcastConfirm,
  broadcastReport,
  deliveryOutcome,
  fillText,
  isCopyable,
  resolveLocale,
  sendWait
} from '../lib';
import { TelegramSharedService } from './telegram-shared.service';

@Injectable()
export class TelegramBroadcastService {
  private readonly logger = new Logger(TelegramBroadcastService.name);
  private isRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly shared: TelegramSharedService
  ) {}

  async start(ctx: BotContext): Promise<void> {
    const locale = resolveLocale(ctx.from?.language_code);
    const reply = ctx.message?.reply_to_message;
    const source = reply?.message_id;

    if (isNullish(reply) || isNullish(source) || !isCopyable(reply)) {
      await ctx.reply(BOT_TEXT[locale].broadcastUsage);

      return;
    }

    await ctx.reply(BOT_TEXT[locale].broadcastAsk, {
      reply_markup: audienceKeyboard({ locale, source }),
      reply_parameters: { message_id: source, allow_sending_without_reply: true }
    });
  }

  async choose(ctx: BotContext): Promise<void> {
    const locale = resolveLocale(ctx.from?.language_code);
    const choice = broadcastChoice(ctx.callbackQuery?.data?.slice(CALLBACK_PREFIX.broadcastAudience.length) ?? '');

    await this.shared.acknowledge({ ctx });

    if (isNullish(choice)) {
      return;
    }

    const count = (await this.recipients(choice.audience)).length;

    if (count === 0) {
      await this.shared.edit({ ctx, text: BOT_TEXT[locale].broadcastNobody });

      return;
    }

    await this.shared.edit({ ctx, ...broadcastConfirm({ choice, count, locale }) });
  }

  async confirm(ctx: BotContext): Promise<void> {
    const locale = resolveLocale(ctx.from?.language_code);
    const text = BOT_TEXT[locale];
    const answer = broadcastAnswer(ctx.callbackQuery?.data?.slice(CALLBACK_PREFIX.broadcastSend.length) ?? '');
    const chatId = ctx.chat?.id;

    if (isNullish(answer) || isNullish(chatId)) {
      await this.shared.acknowledge({ ctx });

      return;
    }

    if (!answer.isConfirmed) {
      await this.shared.acknowledge({ ctx });
      await this.shared.edit({ ctx, text: text.broadcastCancelled });

      return;
    }

    if (this.isRunning) {
      await this.shared.acknowledge({ ctx, text: text.broadcastBusy });

      return;
    }

    this.isRunning = true;

    try {
      await this.shared.acknowledge({ ctx });

      const recipients = await this.recipients(answer.audience);

      await this.shared.edit({ ctx, text: fillText({ text: text.broadcastStarted, fill: { count: String(recipients.length) } }) });

      this.launch({ api: ctx.api, recipients, chatId, source: answer.source, locale });
    } catch (error) {
      this.isRunning = false;
      this.logger.warn(`a broadcast did not start: ${describeError(error)}`);

      await ctx.reply(text.failed);
    }
  }

  private launch(input: BroadcastRunInput): void {
    this.deliver(input)
      .catch((error: unknown) => {
        this.logger.error(`a broadcast stopped: ${describeError(error)}`);
      })
      .finally(() => {
        this.isRunning = false;
      });
  }

  private async deliver({ api, recipients, chatId, source, locale }: BroadcastRunInput): Promise<void> {
    const tally: BroadcastTally = { delivered: 0, blocked: 0, failed: 0 };
    let lastSentAt: number | null = null;
    let isAborted = false;

    for (const telegramId of recipients) {
      await sleep(sendWait({ lastSentAt, now: Date.now() }));

      lastSentAt = Date.now();

      const delivery = await this.send({ api, telegramId, chatId, source, attempt: 0 });

      if (delivery === 'missing') {
        isAborted = true;

        break;
      }

      tally[delivery] += 1;
    }

    this.logger.log(`broadcast ${source} finished: ${tally.delivered} delivered, ${tally.blocked} blocked, ${tally.failed} failed`);

    await api.sendMessage(chatId, broadcastReport({ tally, isAborted, locale }), {
      reply_parameters: { message_id: source, allow_sending_without_reply: true }
    });
  }

  private async send({ api, telegramId, chatId, source, attempt }: BroadcastSendInput): Promise<BroadcastDelivery> {
    try {
      await api.copyMessage(Number(telegramId), chatId, source);

      return 'delivered';
    } catch (error) {
      const outcome = deliveryOutcome(error);

      if (outcome.kind !== 'flood') {
        return outcome.kind;
      }

      if (attempt >= BROADCAST.floodRetries) {
        return 'failed';
      }

      await sleep(milliseconds({ seconds: outcome.retryAfterSeconds }));

      return this.send({ api, telegramId, chatId, source, attempt: attempt + 1 });
    }
  }

  private async recipients(audience: BroadcastAudience): Promise<bigint[]> {
    const chats = await this.prisma.telegramAccount.findMany({
      select: { telegramId: true, user: { select: { subscription: { select: { currentPeriodEnd: true } } } } },
      orderBy: { linkedAt: 'asc' }
    });

    return audienceOf({
      chats: chats.map((chat) => ({ telegramId: chat.telegramId, hasAccess: isPeriodActive(chat.user.subscription?.currentPeriodEnd) })),
      audience
    });
  }
}
