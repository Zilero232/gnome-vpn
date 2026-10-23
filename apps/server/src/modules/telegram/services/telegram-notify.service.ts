import type { AdminMessageOutcome } from '@gnomevpn/schemas';
import type { InlineKeyboard, Keyboard } from 'grammy';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { Bot } from 'grammy';
import { isNonNullish, isNullish } from 'remeda';

import type { ChatState } from '../lib';
import type { DirectMessageInput, MarkupForInput, NoticeSpec, NoticeTextInput, NotifiedChat, NotifyInput } from '../telegram.types';

import { describeError } from '../../../common/lib';
import { PrismaService } from '../../../core';
import { TrialService } from '../../subscription';
import { TELEGRAM_BOT } from '../bot';
import { BOT_TEXT, NOTICES } from '../config';
import { dayCount, failedDelivery, fillText, formatDate, html, mainKeyboard, menuButtons, resolveLocale } from '../lib';
import { NoticeEmailService } from './notice-email.service';

@Injectable()
export class TelegramNotifyService {
  private readonly logger = new Logger(TelegramNotifyService.name);

  constructor(
    @Inject(TELEGRAM_BOT) private readonly bot: Bot | null,
    private readonly prisma: PrismaService,
    private readonly trial: TrialService,
    private readonly email: NoticeEmailService
  ) {}

  async tell(input: NotifyInput): Promise<void> {
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

    try {
      await this.bot.api.sendMessage(Number(chat.telegramId), html.escape(text));

      return 'sent';
    } catch (error) {
      this.logger.warn(`could not message ${userId} in telegram: ${describeError(error)}`);

      return failedDelivery(error);
    }
  }

  async stateOf(userId: string): Promise<ChatState> {
    const { eligibility, hasAccess } = await this.trial.standing(userId);

    return { isSubscribed: hasAccess, isTrialAvailable: eligibility === 'available' };
  }

  private async toChat({ userId, notice, fill, date, days }: NotifyInput): Promise<void> {
    if (isNullish(this.bot)) {
      return;
    }

    try {
      const chat = await this.chatOf(userId);

      if (isNullish(chat)) {
        return;
      }

      const { locale } = chat;
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

      await this.bot.api.sendMessage(Number(chat.telegramId), text, {
        reply_markup: await this.markupFor({ userId, locale, markup: spec.markup }),
        message_effect_id: spec.effect
      });
    } catch (error) {
      this.logger.warn(`could not tell ${userId} in telegram: ${describeError(error)}`);
    }
  }

  private async chatOf(userId: string): Promise<NotifiedChat | null> {
    const row = await this.prisma.telegramAccount.findUnique({
      where: { userId },
      select: { telegramId: true, locale: true, languageCode: true }
    });

    return isNullish(row) ? null : { telegramId: row.telegramId, locale: resolveLocale(row.locale ?? row.languageCode) };
  }

  private async noticeText({ userId, spec, text, hint }: NoticeTextInput): Promise<string> {
    if (!spec.refreshHint) {
      return text;
    }

    const devices = await this.prisma.device.count({ where: { userId } });

    return devices > 0 ? html.paragraphs([text, hint]) : text;
  }

  private async markupFor({ userId, locale, markup }: MarkupForInput): Promise<InlineKeyboard | Keyboard> {
    if (markup === 'main') {
      return mainKeyboard({ locale, state: await this.stateOf(userId) });
    }

    return menuButtons({ locale, keys: markup });
  }
}
