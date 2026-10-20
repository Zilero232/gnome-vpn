import { MAX_FRIEND_DAYS } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isNullish } from 'remeda';

import type { ArriveInput, AttributeNoteInput, BotContext } from '../telegram.types';

import { describeError } from '../../../common/lib';
import { ReferralService } from '../../referrals';
import { BOT_TEXT } from '../config';
import { dayCount, fillText, identityOf, inviteView, refusalText } from '../lib';
import { TelegramAccountService } from './telegram-account.service';
import { TelegramLinkService } from './telegram-link.service';
import { TelegramSharedService } from './telegram-shared.service';

@Injectable()
export class TelegramReferralService {
  private readonly logger = new Logger(TelegramReferralService.name);

  constructor(
    private readonly shared: TelegramSharedService,
    private readonly link: TelegramLinkService,
    private readonly account: TelegramAccountService,
    private readonly referrals: ReferralService
  ) {}

  async invite(ctx: BotContext): Promise<void> {
    await this.shared.withUser({
      ctx,
      act: async (chat) => {
        const overview = await this.referrals.overview(chat.userId);

        return this.shared.reply({ ctx, chat, ...inviteView({ overview, locale: chat.locale }) });
      }
    });
  }

  async arrive({ ctx, code }: ArriveInput): Promise<void> {
    const identity = identityOf(ctx.from);

    if (isNullish(identity)) {
      return;
    }

    const chat = await this.link.ensureChat(identity);
    const note = await this.attribute({ chat, code });

    await this.account.greet({ ctx, chat, note });
  }

  private async attribute({ chat, code }: AttributeNoteInput): Promise<string> {
    const text = BOT_TEXT[chat.locale];

    if (isNullish(code)) {
      return text.referralInvalid;
    }

    try {
      await this.referrals.attribute({ userId: chat.userId, code, source: 'telegram' });
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
}
