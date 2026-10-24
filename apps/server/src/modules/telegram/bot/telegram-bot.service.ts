import type { OnModuleInit } from '@nestjs/common';
import type { Context } from 'grammy';
import type { Update } from 'grammy/types';

import { isShortCode } from '@gnomevpn/schemas';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Bot } from 'grammy';
import { isNonNullish, isNullish } from 'remeda';

import { describeError } from '@/common/lib';

import type { BotHandler } from '../telegram.types';
import type { ActionRoute, BotAction, CommandHandler, OwnerCallback, OwnerCommand, ReaderCallback } from './bot.types';

import { TelegramAccountService } from '../account/telegram-account.service';
import { TelegramOnboardingService } from '../account/telegram-onboarding.service';
import { CALLBACK_PREFIX } from '../config';
import { TelegramAppsService } from '../devices/telegram-apps.service';
import { TelegramDevicesService } from '../devices/telegram-devices.service';
import { TelegramWireguardService } from '../devices/telegram-wireguard.service';
import { TelegramReferralService } from '../invite/telegram-referral.service';
import { TelegramBroadcastService } from '../owner/telegram-broadcast.service';
import { TelegramPromoService } from '../owner/telegram-promo.service';
import { TelegramStatsService } from '../owner/telegram-stats.service';
import { callbackPattern } from '../shared/callback-data';
import { buttonFor } from '../shared/keyboard';
import { TelegramSharedService } from '../shared/telegram-shared.service';
import { TelegramBillingService } from '../subscription/telegram-billing.service';
import { TelegramOffersService } from '../subscription/telegram-offers.service';
import { TelegramSubscriptionService } from '../subscription/telegram-subscription.service';
import { TelegramSupportService } from '../support/telegram-support.service';
import { ANY_CHAT_ROUTES, OWNER_ROUTES, READER_ROUTES } from './bot.config';
import { TELEGRAM_BOT } from './telegram-bot.provider';
import { TelegramProfileService } from './telegram-profile.service';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private readonly logger = new Logger(TelegramBotService.name);
  private readonly actions: readonly BotAction<ActionRoute>[] = READER_ROUTES.actions;
  private ready: Promise<void> = Promise.resolve();

  constructor(
    @Inject(TELEGRAM_BOT) private readonly bot: Bot | null,
    private readonly shared: TelegramSharedService,
    private readonly onboarding: TelegramOnboardingService,
    private readonly account: TelegramAccountService,
    private readonly subscription: TelegramSubscriptionService,
    private readonly apps: TelegramAppsService,
    private readonly billing: TelegramBillingService,
    private readonly devices: TelegramDevicesService,
    private readonly profile: TelegramProfileService,
    private readonly referral: TelegramReferralService,
    private readonly wireguard: TelegramWireguardService,
    private readonly support: TelegramSupportService,
    private readonly stats: TelegramStatsService,
    private readonly broadcast: TelegramBroadcastService,
    private readonly promo: TelegramPromoService,
    private readonly offers: TelegramOffersService
  ) {
    if (this.bot) {
      this.register(this.bot);
    }
  }

  get isEnabled(): boolean {
    return !isNullish(this.bot);
  }

  onModuleInit(): void {
    if (!this.bot) {
      this.logger.log('telegram bot is disabled: no token configured');

      return;
    }

    this.ready = this.profile.announce(this.bot);

    this.ready.catch((error: unknown) => {
      this.logger.error(`telegram bot could not initialise: ${describeError(error)}`);
    });
  }

  async handleUpdate(update: Update): Promise<void> {
    if (!this.bot) {
      return;
    }

    try {
      await this.ready;
      await this.bot.handleUpdate(update);
    } catch (error) {
      this.logger.error(`telegram update failed: ${describeError(error)}`);
    }
  }

  private get actionHandlers() {
    return {
      sendLink: (ctx) => this.subscription.sendLink(ctx),
      status: (ctx) => this.subscription.status(ctx),
      buy: (ctx) => this.subscription.buy(ctx),
      trial: (ctx) => this.subscription.claimTrialDay(ctx),
      apps: (ctx) => this.apps.list(ctx),
      devices: (ctx) => this.devices.list(ctx),
      wireguard: (ctx) => this.wireguard.list(ctx),
      more: (ctx) => this.account.more(ctx),
      invite: (ctx) => this.referral.invite(ctx),
      rotate: (ctx) => this.billing.askRotate(ctx),
      autoRenew: (ctx) => this.billing.autoRenew(ctx),
      website: (ctx) => this.account.openWebsite(ctx),
      language: (ctx) => this.account.chooseLanguage(ctx),
      offers: (ctx) => this.offers.show(ctx),
      help: (ctx) => this.account.help(ctx),
      support: (ctx) => this.support.open(ctx),
      unlink: (ctx) => this.account.askUnlink(ctx),
      deleteAccount: (ctx) => this.account.askDelete(ctx)
    } satisfies Record<ActionRoute, BotHandler>;
  }

  private get callbackHandlers() {
    return {
      menu: (ctx) => this.openMenu(ctx),
      plan: (ctx) => this.subscription.startCheckout(ctx),
      locale: (ctx) => this.account.changeLocale(ctx),
      client: (ctx) => this.apps.show(ctx),
      unlink: (ctx) => this.account.confirmUnlink(ctx),
      deleteAccount: (ctx) => this.account.confirmDelete(ctx),
      rotate: (ctx) => this.billing.confirmRotate(ctx),
      autoRenew: (ctx) => this.billing.changeAutoRenew(ctx),
      offers: (ctx) => this.offers.change(ctx),
      devices: (ctx) => this.devices.buyDevices(ctx),
      forgetDevice: (ctx) => this.devices.askRemove(ctx),
      removeDevice: (ctx) => this.devices.confirmRemove(ctx),
      wireguard: (ctx) => this.wireguard.show(ctx),
      wireguardNode: (ctx) => this.wireguard.pickKind(ctx),
      wireguardCreate: (ctx) => this.wireguard.create(ctx),
      wireguardFile: (ctx) => this.wireguard.file(ctx)
    } satisfies Record<ReaderCallback, BotHandler>;
  }

  private get ownerCommandHandlers() {
    return {
      stats: (ctx) => this.stats.show(ctx),
      broadcast: (ctx) => this.broadcast.start(ctx),
      promo: (ctx) => this.promo.handle(ctx)
    } satisfies Record<OwnerCommand, CommandHandler>;
  }

  private get ownerCallbackHandlers() {
    return {
      broadcastAudience: (ctx) => this.broadcast.choose(ctx),
      broadcastSend: (ctx) => this.broadcast.confirm(ctx)
    } satisfies Record<OwnerCallback, BotHandler>;
  }

  private register(bot: Bot): void {
    bot.command(ANY_CHAT_ROUTES.chatIdCommand, (ctx) => this.account.chatId(ctx));

    const owner = bot.filter((ctx) => this.shared.isAdminChat(ctx));

    for (const command of OWNER_ROUTES.commands) {
      owner.command(command, this.ownerCommandHandlers[command]);
    }

    for (const key of OWNER_ROUTES.callbacks) {
      owner.callbackQuery(callbackPattern(CALLBACK_PREFIX[key]), this.ownerCallbackHandlers[key]);
    }

    owner.on('message', (ctx, next) => this.support.answer({ ctx, next }));

    const direct = bot.chatType('private');

    direct.command('start', (ctx) => this.onboarding.start(ctx));

    for (const { command, route } of this.actions) {
      if (command) {
        direct.command(command, this.actionHandlers[route]);
      }
    }

    for (const key of READER_ROUTES.callbacks) {
      direct.callbackQuery(callbackPattern(CALLBACK_PREFIX[key]), this.callbackHandlers[key]);
    }

    direct.on('message:text', (ctx) => this.read(ctx));
    direct.on([...READER_ROUTES.supportMedia], (ctx) => this.support.relay(ctx));

    bot.chatType([...ANY_CHAT_ROUTES.groupChats]).command('start', (ctx) => this.account.groupOnly(ctx));
    bot.on('my_chat_member', (ctx) => this.account.joined(ctx));
    bot.on('callback_query', (ctx) => this.shared.acknowledge({ ctx }));
  }

  private async openMenu(ctx: Context): Promise<void> {
    const pressed = this.pressed(ctx.callbackQuery?.data?.slice(CALLBACK_PREFIX.menu.length));

    await this.shared.acknowledge({ ctx });

    if (isNonNullish(pressed)) {
      await pressed(ctx);
    }
  }

  private read(ctx: Context): Promise<void> {
    const text = ctx.message?.text ?? '';
    const pressed = this.pressed(buttonFor(text));

    if (isNonNullish(pressed)) {
      return pressed(ctx);
    }

    if (isShortCode(text)) {
      return this.onboarding.consume({ ctx, text });
    }

    return this.support.accepts(ctx) && !text.startsWith(READER_ROUTES.commandPrefix) ? this.support.relay(ctx) : this.account.help(ctx);
  }

  private pressed(button: string | null | undefined): BotHandler | undefined {
    const action = this.actions.find((each) => each.button === button);

    return isNonNullish(action) ? this.actionHandlers[action.route] : undefined;
  }
}
