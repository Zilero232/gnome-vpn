import type { CommandContext, Context } from 'grammy';

import { isShortCode, MAX_FRIEND_DAYS } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isNonNullish, isNullish } from 'remeda';

import { describeError } from '@/common/lib';
import { AppConfigService } from '@/config';
import { isReferralStart, referralCodeFromStart, ReferralService } from '@/modules/referrals';

import type { BotLocale } from '../telegram.types';
import type { ArriveInput, AttributeNoteInput, ConsumeInput, GreetInput, WelcomeInput } from './account.types';

import { BOT_TEXT, DEFAULT_BOT_LOCALE, MESSAGE_EFFECT } from '../config';
import { TelegramChatsService } from '../notify';
import { TelegramSharedService } from '../shared/telegram-shared.service';
import { dayCount, fillText, html, refusalText } from '../shared/text';
import { identityOf } from '../shared/update';
import { TelegramLinkService } from './telegram-link.service';

@Injectable()
export class TelegramOnboardingService {
  private readonly logger = new Logger(TelegramOnboardingService.name);

  constructor(
    private readonly shared: TelegramSharedService,
    private readonly link: TelegramLinkService,
    private readonly chats: TelegramChatsService,
    private readonly referrals: ReferralService,
    private readonly config: AppConfigService
  ) {}

  start(ctx: CommandContext<Context>): Promise<void> {
    const code = ctx.match;

    if (isReferralStart(code)) {
      return this.arrive({ ctx, code: referralCodeFromStart(code) });
    }

    return isShortCode(code) ? this.consume({ ctx, text: code }) : this.welcome({ ctx });
  }

  async welcome({ ctx, note }: WelcomeInput): Promise<void> {
    const identity = identityOf(ctx.from);

    if (isNullish(identity)) {
      return;
    }

    const chat = await this.link.ensureChat(identity);

    await this.greet({ ctx, chat, note });
  }

  async consume({ ctx, text }: ConsumeInput): Promise<void> {
    const identity = identityOf(ctx.from);

    if (isNullish(identity)) {
      return;
    }

    const known = await this.chats.findChat(identity.telegramId);
    const copy = isNonNullish(known) ? BOT_TEXT[known.locale] : this.shared.textFor(ctx);

    try {
      await this.link.consumeCode({ code: text, ...identity });
    } catch (error) {
      const refusal = refusalText({
        error,
        copies: { TELEGRAM_ALREADY_LINKED: copy.alreadyLinked, TELEGRAM_CODE_INVALID: copy.codeInvalid },
        fallback: copy.failed,
        onUnknown: (reason) => this.logger.warn(`telegram link failed: ${describeError(reason)}`)
      });

      await this.shared.reply({ ctx, chat: known, text: refusal });

      return;
    }

    const chat = await this.chats.findChat(identity.telegramId);
    const locale = chat?.locale ?? DEFAULT_BOT_LOCALE;

    await this.shared.reply({ ctx, chat, text: BOT_TEXT[locale].linked, effect: MESSAGE_EFFECT.celebrate });
  }

  private async arrive({ ctx, code }: ArriveInput): Promise<void> {
    const identity = identityOf(ctx.from);

    if (isNullish(identity)) {
      return;
    }

    const chat = await this.link.ensureChat(identity);
    const note = await this.attribute({ chat, code });

    await this.greet({ ctx, chat, note });
  }

  private async attribute({ chat, code }: AttributeNoteInput): Promise<string> {
    const text = BOT_TEXT[chat.locale];

    if (isNullish(code)) {
      return text.referralInvalid;
    }

    try {
      await this.referrals.attribute({ userId: chat.userId, code });
    } catch (error) {
      return refusalText({
        error,
        copies: { REFERRAL_SELF: text.referralSelf, REFERRAL_UNAVAILABLE: text.referralUnavailable, REFERRAL_CODE_INVALID: text.referralInvalid },
        fallback: text.referralUnavailable,
        onUnknown: (reason) => this.logger.warn(`telegram referral failed: ${describeError(reason)}`)
      });
    }

    return fillText({ text: text.referralWelcome, fill: { days: dayCount({ days: MAX_FRIEND_DAYS, locale: chat.locale }) } });
  }

  private async greet({ ctx, chat, note }: GreetInput): Promise<void> {
    const greeting = chat.isNew ? this.startText(chat.locale) : BOT_TEXT[chat.locale].welcomeBack;

    await this.shared.reply({ ctx, chat, text: html.paragraphs([greeting, note]) });
  }

  private startText(locale: BotLocale): string {
    const text = BOT_TEXT[locale];

    return html.paragraphs([
      fillText({ text: text.start, fill: { site: this.config.get('CLIENT_URL') } }),
      fillText({ text: text.consentLine, fill: { link: this.shared.consentUrl(locale) } })
    ]);
  }
}
