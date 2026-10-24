import type { Context } from 'grammy';

import { Injectable } from '@nestjs/common';

import { ReferralService } from '@/modules/referrals';

import { TelegramSharedService } from '../shared/telegram-shared.service';
import { inviteView } from './invite-view';

@Injectable()
export class TelegramReferralService {
  constructor(
    private readonly shared: TelegramSharedService,
    private readonly referrals: ReferralService
  ) {}

  async invite(ctx: Context): Promise<void> {
    await this.shared.withUser({
      ctx,
      act: async (chat) => {
        const overview = await this.referrals.overview(chat.userId);

        return this.shared.reply({ ctx, chat, ...inviteView({ overview, locale: chat.locale }) });
      }
    });
  }
}
