import type { AdminMessageOutcome } from '@gnomevpn/schemas';
import type { InlineKeyboard, Keyboard } from 'grammy';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { Bot } from 'grammy';
import { isNonNullish, isNullish } from 'remeda';

import { describeError } from '@/common/lib';
import { PrismaService } from '@/core';
import { ConsentService } from '@/modules/consents';
import { TrialService } from '@/modules/subscription';

import type { ChatState } from '../lib';
import type {
  DeliverInput,
  DirectMessageInput,
  MarkupForInput,
  NoticeSpec,
  NoticeTextInput,
  NotifiedChat,
  NotifyInput,
  SendNoticeInput,
  SetBlockedInput
} from '../telegram.types';

import { TELEGRAM_BOT } from '../bot';
import { BOT_TEXT, NOTICES } from '../config';
import {
  dayCount,
  deliveryOutcome,
  fillText,
  formatDate,
  html,
  inviteLine,
  mainKeyboard,
  menuButtons,
  noticeLayout,
  offersButton,
  resolveLocale
} from '../lib';
import { NoticeEmailService } from './notice-email.service';

@Injectable()
export class TelegramNotifyService {
  private readonly logger = new Logger(TelegramNotifyService.name);

  constructor(
    @Inject(TELEGRAM_BOT) private readonly bot: Bot | null,
    private readonly prisma: PrismaService,
    private readonly trial: TrialService,
    private readonly email: NoticeEmailService,
    private readonly consents: ConsentService
  ) {}

  async tell(input: NotifyInput): Promise<void> {
    const spec: NoticeSpec = NOTICES[input.notice];

    if (spec.isPromotional && !(await this.mayPromote(input.userId))) {
      return;
    }

    await Promise.all([this.toChat(input), this.email.send(input)]);
  }

  async farewell(userId: string): Promise<void> {
    if (isNullish(this.bot)) {
      return;
    }

    try {
      const chat = await this.chatOf(userId);

      if (isNullish(chat)) {
        return;
      }

      await this.bot.api.sendMessage(Number(chat.telegramId), BOT_TEXT[chat.locale].unlinked, { reply_markup: { remove_keyboard: true } });
    } catch (error) {
      this.logger.warn(`could not say goodbye to ${userId} in telegram: ${describeError(error)}`);
    }
  }

  async message({ userId, text }: DirectMessageInput): Promise<AdminMessageOutcome> {
    if (isNullish(this.bot)) {
      return 'botOff';
    }

    const chat = await this.chatOf(userId);

    if (isNullish(chat)) {
      return 'notLinked';
    }

    const { bot } = this;

    try {
      await this.deliver({ chat, send: () => bot.api.sendMessage(Number(chat.telegramId), html.escape(text)) });

      return 'sent';
    } catch (error) {
      this.logger.warn(`could not message ${userId} in telegram: ${describeError(error)}`);

      return deliveryOutcome(error).kind === 'blocked' ? 'blocked' : 'failed';
    }
  }

  async stateOf(userId: string): Promise<ChatState> {
    const { eligibility, hasAccess } = await this.trial.standing(userId);

    return { isSubscribed: hasAccess, isTrialAvailable: eligibility === 'available' };
  }

  private async toChat(input: NotifyInput): Promise<void> {
    const { bot } = this;

    if (isNullish(bot)) {
      return;
    }

    try {
      const chat = await this.chatOf(input.userId);

      if (isNonNullish(chat)) {
        await this.deliver({ chat, send: () => this.sendNotice({ bot, chat, input }) });
      }
    } catch (error) {
      this.logger.warn(`could not tell ${input.userId} in telegram: ${describeError(error)}`);
    }
  }

  private async sendNotice({ bot, chat, input }: SendNoticeInput): Promise<void> {
    const { userId, notice, fill, date, days, invite } = input;
    const { locale } = chat;
    const chatId = Number(chat.telegramId);
    const spec: NoticeSpec = NOTICES[notice];
    const tokens = {
      ...fill,
      ...(date && { date: formatDate({ iso: date.toISOString(), locale }) }),
      ...(isNonNullish(days) && { days: dayCount({ days, locale }) })
    };

    const text = await this.noticeText({
      userId,
      spec,
      text: fillText({ text: BOT_TEXT[locale][notice], fill: tokens }),
      hint: BOT_TEXT[locale].refreshHint
    });

    const layout = noticeLayout({ text, markup: spec.markup, prompt: isNullish(invite) ? null : inviteLine({ planId: invite, locale }) });

    await bot.api.sendMessage(chatId, layout.text, {
      reply_markup: await this.markupFor({ userId, locale, markup: layout.markup, isPromotional: spec.isPromotional }),
      message_effect_id: spec.effect
    });

    if (isNonNullish(layout.followUp)) {
      await bot.api.sendMessage(chatId, layout.followUp, { reply_markup: menuButtons({ locale, keys: ['invite'] }) });
    }
  }

  private async mayPromote(userId: string): Promise<boolean> {
    try {
      return await this.consents.isMarketingGranted(userId);
    } catch (error) {
      this.logger.warn(`could not read the marketing consent of ${userId}, the offer is not sent: ${describeError(error)}`);

      return false;
    }
  }

  private async deliver({ chat, send }: DeliverInput): Promise<void> {
    try {
      await send();
    } catch (error) {
      if (deliveryOutcome(error).kind === 'blocked') {
        await this.markBlocked({ telegramId: chat.telegramId, blockedAt: new Date() });
      }

      throw error;
    }

    if (chat.isBlocked) {
      await this.markBlocked({ telegramId: chat.telegramId, blockedAt: null });
    }
  }

  private async markBlocked({ telegramId, blockedAt }: SetBlockedInput): Promise<void> {
    await this.prisma.telegramAccount.updateMany({ where: { telegramId }, data: { blockedAt } }).catch((error: unknown) => {
      this.logger.warn(`could not record whether chat ${telegramId} blocked the bot: ${describeError(error)}`);
    });
  }

  private async chatOf(userId: string): Promise<NotifiedChat | null> {
    const row = await this.prisma.telegramAccount.findUnique({
      where: { userId },
      select: { telegramId: true, locale: true, languageCode: true, blockedAt: true }
    });

    return isNullish(row)
      ? null
      : { telegramId: row.telegramId, locale: resolveLocale(row.locale ?? row.languageCode), isBlocked: isNonNullish(row.blockedAt) };
  }

  private async noticeText({ userId, spec, text, hint }: NoticeTextInput): Promise<string> {
    if (!spec.refreshHint) {
      return text;
    }

    const devices = await this.prisma.device.count({ where: { userId } });

    return devices > 0 ? html.paragraphs([text, hint]) : text;
  }

  private async markupFor({ userId, locale, markup, isPromotional }: MarkupForInput): Promise<InlineKeyboard | Keyboard> {
    if (markup === 'main') {
      return mainKeyboard({ locale, state: await this.stateOf(userId) });
    }

    const buttons = menuButtons({ locale, keys: markup });

    return isPromotional ? buttons.row(offersButton({ isOn: true, locale })) : buttons;
  }
}
