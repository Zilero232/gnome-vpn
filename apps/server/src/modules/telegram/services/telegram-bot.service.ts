import type { OnModuleInit } from '@nestjs/common';
import type { Update } from 'grammy/types';

import { isShortCode } from '@gnomevpn/schemas';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Bot } from 'grammy';
import { isNonNullish, isNullish } from 'remeda';

import type { BotAction, BotCallback, BotContext, OwnerAction } from '../telegram.types';

import { describeError } from '../../../common/lib';
import { isReferralStart, referralCodeFromStart } from '../../referrals';
import { TELEGRAM_BOT } from '../bot';
import { CALLBACK_PREFIX, CHAT_ID_COMMAND, GROUP_CHATS, SUPPORT, SUPPORT_MEDIA } from '../config';
import { buttonFor, callbackPattern } from '../lib';
import { TelegramAccountService } from './telegram-account.service';
import { TelegramAppsService } from './telegram-apps.service';
import { TelegramBillingService } from './telegram-billing.service';
import { TelegramBroadcastService } from './telegram-broadcast.service';
import { TelegramDevicesService } from './telegram-devices.service';
import { TelegramOffersService } from './telegram-offers.service';
import { TelegramProfileService } from './telegram-profile.service';
import { TelegramPromoService } from './telegram-promo.service';
import { TelegramReferralService } from './telegram-referral.service';
import { TelegramSharedService } from './telegram-shared.service';
import { TelegramStatsService } from './telegram-stats.service';
import { TelegramSubscriptionService } from './telegram-subscription.service';
import { TelegramSupportService } from './telegram-support.service';
import { TelegramWireguardService } from './telegram-wireguard.service';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private readonly logger = new Logger(TelegramBotService.name);
  private ready: Promise<void> = Promise.resolve();

  constructor(
    @Inject(TELEGRAM_BOT) private readonly bot: Bot | null,
    private readonly shared: TelegramSharedService,
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

  get actions(): BotAction[] {
    return [
      { command: 'connect', button: 'connect', run: (ctx) => this.subscription.sendLink(ctx) },
      { command: 'link', run: (ctx) => this.subscription.sendLink(ctx) },
      { command: 'status', button: 'status', run: (ctx) => this.subscription.status(ctx) },
      { command: 'buy', button: 'buy', run: (ctx) => this.subscription.buy(ctx) },
      { button: 'renew', run: (ctx) => this.subscription.buy(ctx) },
      { command: 'trial', button: 'trial', run: (ctx) => this.subscription.claimTrialDay(ctx) },
      { command: 'apps', button: 'apps', run: (ctx) => this.apps.list(ctx) },
      { command: 'devices', button: 'devices', run: (ctx) => this.devices.list(ctx) },
      { command: 'wireguard', button: 'wireguard', run: (ctx) => this.wireguard.list(ctx) },
      { button: 'more', run: (ctx) => this.account.more(ctx) },
      { command: 'invite', button: 'invite', run: (ctx) => this.referral.invite(ctx) },
      { command: 'rotate', button: 'rotate', run: (ctx) => this.billing.askRotate(ctx) },
      { button: 'autoRenew', run: (ctx) => this.billing.autoRenew(ctx) },
      { command: 'website', button: 'website', run: (ctx) => this.account.openWebsite(ctx) },
      { command: 'language', button: 'language', run: (ctx) => this.account.chooseLanguage(ctx) },
      { command: 'offers', run: (ctx) => this.offers.show(ctx) },
      { command: 'help', button: 'help', run: (ctx) => this.account.help(ctx) },
      { command: 'support', button: 'support', run: (ctx) => this.support.open(ctx) },
      { command: 'unlink', button: 'unlink', run: (ctx) => this.account.askUnlink(ctx) },
      { command: 'delete', button: 'deleteAccount', run: (ctx) => this.account.askDelete(ctx) }
    ];
  }

  get ownerActions(): OwnerAction[] {
    return [
      { command: 'stats', run: (ctx) => this.stats.show(ctx) },
      { command: 'broadcast', run: (ctx) => this.broadcast.start(ctx) },
      { command: 'promo', run: (ctx) => this.promo.handle(ctx) }
    ];
  }

  get ownerCallbacks(): BotCallback[] {
    return [
      { prefix: CALLBACK_PREFIX.broadcastAudience, run: (ctx) => this.broadcast.choose(ctx) },
      { prefix: CALLBACK_PREFIX.broadcastSend, run: (ctx) => this.broadcast.confirm(ctx) }
    ];
  }

  private get callbacks(): BotCallback[] {
    return [
      { prefix: CALLBACK_PREFIX.menu, run: (ctx) => this.openMenu(ctx) },
      { prefix: CALLBACK_PREFIX.plan, run: (ctx) => this.subscription.startCheckout(ctx) },
      { prefix: CALLBACK_PREFIX.locale, run: (ctx) => this.account.changeLocale(ctx) },
      { prefix: CALLBACK_PREFIX.client, run: (ctx) => this.apps.show(ctx) },
      { prefix: CALLBACK_PREFIX.unlink, run: (ctx) => this.account.confirmUnlink(ctx) },
      { prefix: CALLBACK_PREFIX.deleteAccount, run: (ctx) => this.account.confirmDelete(ctx) },
      { prefix: CALLBACK_PREFIX.rotate, run: (ctx) => this.billing.confirmRotate(ctx) },
      { prefix: CALLBACK_PREFIX.autoRenew, run: (ctx) => this.billing.changeAutoRenew(ctx) },
      { prefix: CALLBACK_PREFIX.offers, run: (ctx) => this.offers.change(ctx) },
      { prefix: CALLBACK_PREFIX.devices, run: (ctx) => this.devices.buyDevices(ctx) },
      { prefix: CALLBACK_PREFIX.forgetDevice, run: (ctx) => this.devices.askRemove(ctx) },
      { prefix: CALLBACK_PREFIX.removeDevice, run: (ctx) => this.devices.confirmRemove(ctx) },
      { prefix: CALLBACK_PREFIX.wireguard, run: (ctx) => this.wireguard.show(ctx) },
      { prefix: CALLBACK_PREFIX.wireguardNode, run: (ctx) => this.wireguard.pickKind(ctx) },
      { prefix: CALLBACK_PREFIX.wireguardCreate, run: (ctx) => this.wireguard.create(ctx) },
      { prefix: CALLBACK_PREFIX.wireguardFile, run: (ctx) => this.wireguard.file(ctx) }
    ];
  }

  private register(bot: Bot): void {
    bot.command(CHAT_ID_COMMAND, (ctx) => this.account.chatId(ctx));

    const owner = bot.filter((ctx) => this.shared.isAdminChat(ctx));

    for (const { command, run } of this.ownerActions) {
      owner.command(command, run);
    }

    for (const { prefix, run } of this.ownerCallbacks) {
      owner.callbackQuery(callbackPattern(prefix), run);
    }

    owner.on('message', (ctx, next) => this.support.answer({ ctx, next }));

    const direct = bot.chatType('private');

    direct.command('start', (ctx) => this.start(ctx));

    for (const { command, run } of this.actions) {
      if (command) {
        direct.command(command, run);
      }
    }

    for (const { prefix, run } of this.callbacks) {
      direct.callbackQuery(callbackPattern(prefix), run);
    }

    direct.on('message:text', (ctx) => this.read(ctx));
    direct.on([...SUPPORT_MEDIA], (ctx) => this.support.relay(ctx));

    bot.chatType([...GROUP_CHATS]).command('start', (ctx) => this.account.groupOnly(ctx));
    bot.on('my_chat_member', (ctx) => this.account.joined(ctx));
    bot.on('callback_query', (ctx) => this.shared.acknowledge({ ctx }));
  }

  private start(ctx: BotContext): Promise<void> {
    const code = typeof ctx.match === 'string' ? ctx.match : '';

    if (isReferralStart(code)) {
      return this.referral.arrive({ ctx, code: referralCodeFromStart(code) });
    }

    return isShortCode(code) ? this.account.consume({ ctx, text: code }) : this.account.welcome({ ctx });
  }

  private async openMenu(ctx: BotContext): Promise<void> {
    const pressed = this.actionFor(ctx.callbackQuery?.data?.slice(CALLBACK_PREFIX.menu.length));

    await this.shared.acknowledge({ ctx });

    if (isNonNullish(pressed)) {
      await pressed.run(ctx);
    }
  }

  private read(ctx: BotContext): Promise<void> {
    const text = ctx.message?.text ?? '';
    const pressed = this.actionFor(buttonFor(text));

    if (isNonNullish(pressed)) {
      return pressed.run(ctx);
    }

    if (isShortCode(text)) {
      return this.account.consume({ ctx, text });
    }

    return this.support.accepts(ctx) && !text.startsWith(SUPPORT.commandPrefix) ? this.support.relay(ctx) : this.account.help(ctx);
  }

  private actionFor(button: string | null | undefined): BotAction | undefined {
    return this.actions.find((action) => action.button === button);
  }
}
