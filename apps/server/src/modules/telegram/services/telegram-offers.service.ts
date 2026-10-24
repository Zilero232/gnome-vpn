import { Injectable } from '@nestjs/common';
import { isNullish } from 'remeda';

import { ConsentService } from '@/modules/consents';

import type { BotContext } from '../telegram.types';

import { CALLBACK_PREFIX } from '../config';
import { offersChoice, offersPanel } from '../lib';
import { TelegramSharedService } from './telegram-shared.service';

@Injectable()
export class TelegramOffersService {
  constructor(
    private readonly shared: TelegramSharedService,
    private readonly consents: ConsentService
  ) {}

  async show(ctx: BotContext): Promise<void> {
    await this.shared.withUser({
      ctx,
      act: async (chat) => {
        const isOn = await this.consents.isMarketingGranted(chat.userId);

        return this.shared.reply({ ctx, chat, ...offersPanel({ isOn, locale: chat.locale }) });
      }
    });
  }

  async change(ctx: BotContext): Promise<void> {
    await this.shared.answered({
      ctx,
      prefix: CALLBACK_PREFIX.offers,
      act: async ({ chat, value }) => {
        const granted = offersChoice(value);

        if (isNullish(granted)) {
          return;
        }

        await this.consents.setMarketing({ userId: chat.userId, granted, source: 'bot' });

        return this.shared.edit({ ctx, ...offersPanel({ isOn: granted, locale: chat.locale }) });
      }
    });
  }
}
