import { Module } from '@nestjs/common';

import { AdminModule } from '../admin';
import { AuthModule } from '../auth';
import { BillingModule } from '../billing';
import { DevicesModule } from '../devices';
import { PeersModule } from '../peers';
import { PromoCodesModule } from '../promo-codes';
import { ReferralsModule } from '../referrals';
import { SubscriptionModule } from '../subscription';
import { SubscriptionLinkModule } from '../subscription-link';
import {
  TelegramAccountService,
  TelegramAppsService,
  TelegramBillingService,
  TelegramBotService,
  TelegramBroadcastService,
  TelegramDevicesService,
  TelegramLinkService,
  TelegramProfileService,
  TelegramPromoService,
  TelegramReferralService,
  TelegramSharedService,
  TelegramStatsService,
  TelegramSubscriptionService,
  TelegramSupportService,
  TelegramWebLoginService,
  TelegramWireguardService
} from './services';
import { TelegramLinkController } from './telegram-link.controller';
import { TelegramNotifyModule } from './telegram-notify.module';
import { TelegramWebLoginController } from './telegram-web-login.controller';
import { TelegramController } from './telegram.controller';

@Module({
  imports: [
    AdminModule,
    AuthModule,
    BillingModule,
    DevicesModule,
    PeersModule,
    PromoCodesModule,
    ReferralsModule,
    SubscriptionModule,
    SubscriptionLinkModule,
    TelegramNotifyModule
  ],
  controllers: [TelegramController, TelegramLinkController, TelegramWebLoginController],
  providers: [
    TelegramAccountService,
    TelegramAppsService,
    TelegramBillingService,
    TelegramBotService,
    TelegramBroadcastService,
    TelegramDevicesService,
    TelegramLinkService,
    TelegramProfileService,
    TelegramPromoService,
    TelegramReferralService,
    TelegramSharedService,
    TelegramStatsService,
    TelegramSubscriptionService,
    TelegramSupportService,
    TelegramWebLoginService,
    TelegramWireguardService
  ],
  exports: [TelegramLinkService]
})
export class TelegramModule {}
