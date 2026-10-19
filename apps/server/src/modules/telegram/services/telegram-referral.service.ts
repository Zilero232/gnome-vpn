import { MAX_FRIEND_DAYS } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isNullish } from 'remeda';
import { match } from 'ts-pattern';

import type { ArriveInput, AttributeNoteInput, BotContext, RefusalInput } from '../telegram.types';

import { describeError, errorCodeOf } from '../../../common/lib';
import { ReferralService } from '../../referrals';
import { BOT_TEXT } from '../config';
import { dayCount, fillText, identityOf, inviteView } from '../lib';
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

    await this.account.welcome({ ctx, note });
  }

  private async attribute({ chat, code }: AttributeNoteInput): Promise<string> {
    const text = BOT_TEXT[chat.locale];

    try {
      await this.referrals.attribute({ userId: chat.userId, code, source: 'telegram' });
    } catch (error) {
      return this.refusalFor({ error, copy: text });
    }

    return fillText({ text: text.referralWelcome, fill: { days: dayCount({ days: MAX_FRIEND_DAYS, locale: chat.locale }) } });
  }

  private refusalFor({ error, copy }: RefusalInput): string {
    return match(errorCodeOf(error))
      .with('REFERRAL_SELF', () => copy.referralSelf)
      .with('REFERRAL_UNAVAILABLE', () => copy.referralUnavailable)
      .with('REFERRAL_CODE_INVALID', () => copy.referralInvalid)
      .otherwise(() => {
        this.logger.warn(`telegram referral failed: ${describeError(error)}`);

        return copy.referralUnavailable;
      });
  }
}
