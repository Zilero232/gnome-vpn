import { Injectable, Logger } from '@nestjs/common';
import { isNullish } from 'remeda';
import { match } from 'ts-pattern';

import type { BotContext } from '../telegram.types';

import { describeError, errorCodeOf } from '../../../common/lib';
import { CheckoutService } from '../../billing';
import { DevicesService } from '../../devices';
import { SubscriptionService, TrialService } from '../../subscription';
import { SubscriptionLinkService } from '../../subscription-link';
import { BOT_TEXT, CALLBACK_PREFIX, MESSAGE_EFFECT } from '../config';
import {
  checkoutIntro,
  fillLabel,
  linkMessage,
  menuButtons,
  noAccessMessage,
  offerKeys,
  parsePlanId,
  planKeyboard,
  plansText,
  statusText,
  urlMessage
} from '../lib';
import { TelegramSharedService } from './telegram-shared.service';

@Injectable()
export class TelegramSubscriptionService {
  private readonly logger = new Logger(TelegramSubscriptionService.name);

  constructor(
    private readonly shared: TelegramSharedService,
    private readonly subscription: SubscriptionService,
    private readonly subscriptionLink: SubscriptionLinkService,
    private readonly checkout: CheckoutService,
    private readonly trial: TrialService,
    private readonly devices: DevicesService
  ) {}

  async status(ctx: BotContext): Promise<void> {
    await this.shared.withUser({
      ctx,
      act: async (chat) => {
        const [status, list] = await Promise.all([this.subscription.getStatus(chat.userId), this.devices.list(chat.userId)]);

        return this.shared.reply({
          ctx,
          chat,
          text: statusText({ ...status, deviceCount: list.devices.length, locale: chat.locale }),
          markup: menuButtons({ locale: chat.locale, keys: offerKeys(status) })
        });
      }
    });
  }

  async sendLink(ctx: BotContext): Promise<void> {
    await this.shared.withUser({
      ctx,
      act: async (chat) => {
        const text = BOT_TEXT[chat.locale];
        const status = await this.subscription.getStatus(chat.userId);

        if (status.period === 'none') {
          return this.shared.reply({ ctx, chat, ...noAccessMessage({ status, locale: chat.locale }) });
        }

        const { url } = await this.subscriptionLink.get(chat.userId);

        return this.shared.reply({ ctx, chat, ...linkMessage({ locale: chat.locale, intro: text.linkIntro, url }) });
      }
    });
  }

  async buy(ctx: BotContext): Promise<void> {
    await this.shared.withUser({
      ctx,
      act: async ({ userId, locale }) => {
        const { period } = await this.subscription.getStatus(userId);

        return ctx.reply(plansText({ locale, isExtending: period === 'paid' }), { reply_markup: planKeyboard(locale) });
      }
    });
  }

  async claimTrialDay(ctx: BotContext): Promise<void> {
    await this.shared.withUser({
      ctx,
      act: async (chat) => {
        const text = BOT_TEXT[chat.locale];
        const { eligibility, hasAccess } = await this.trial.standing(chat.userId);

        const refusal = match({ eligibility, hasAccess })
          .with({ hasAccess: true }, () => text.trialHasAccess)
          .with({ eligibility: 'emailUnverified' }, () => text.trialNeedsEmail)
          .with({ eligibility: 'used' }, () => text.trialUnavailable)
          .with({ eligibility: 'available' }, () => null)
          .exhaustive();

        if (refusal) {
          return this.shared.reply({ ctx, chat, text: refusal });
        }

        try {
          await this.trial.claim(chat.userId);
        } catch (error) {
          if (errorCodeOf(error) === 'TRIAL_ALREADY_USED') {
            return this.shared.reply({ ctx, chat, text: text.trialUnavailable });
          }

          throw error;
        }

        return this.shared.reply({ ctx, chat, text: text.trialGranted, effect: MESSAGE_EFFECT.celebrate });
      }
    });
  }

  async startCheckout(ctx: BotContext): Promise<void> {
    if (!(await this.shared.claimCheckout(ctx))) {
      await this.shared.acknowledge({ ctx, text: this.shared.textFor(ctx).checkoutWait });

      return;
    }

    await this.shared.answered({
      ctx,
      prefix: CALLBACK_PREFIX.plan,
      act: async ({ chat, value }) => {
        const text = BOT_TEXT[chat.locale];
        const planId = parsePlanId(value);

        if (isNullish(planId)) {
          return;
        }

        this.shared.typing(ctx);

        try {
          const { confirmationUrl, amountRub, discount } = await this.checkout.createCheckout({
            userId: chat.userId,
            planId,
            returnUrl: this.shared.returnUrl()
          });

          const amount = String(amountRub);
          const intro = checkoutIntro({ planId, amountRub, discount, termsUrl: this.shared.termsUrl(chat.locale), locale: chat.locale });
          const label = fillLabel({ text: text.checkoutButton, fill: { amount } });

          return this.shared.edit({ ctx, ...urlMessage({ intro, url: confirmationUrl, label, style: 'success' }) });
        } catch (error) {
          this.logger.warn(`telegram checkout failed: ${describeError(error)}`);

          return this.shared.reply({ ctx, chat, text: text.failed });
        }
      }
    });
  }
}
