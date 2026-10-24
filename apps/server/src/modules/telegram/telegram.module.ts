import { Module } from '@nestjs/common';

import { AdminModule } from '@/modules/admin';
import { AuthModule } from '@/modules/auth';
import { BillingModule } from '@/modules/billing';
import { ConsentsModule } from '@/modules/consents';
import { DevicesModule } from '@/modules/devices';
import { PeersModule } from '@/modules/peers';
import { PromoCodesModule } from '@/modules/promo-codes';
import { ReferralsModule } from '@/modules/referrals';
import { SubscriptionModule } from '@/modules/subscription';
import { SubscriptionLinkModule } from '@/modules/subscription-link';

import { TelegramAccountService } from './account/telegram-account.service';
import { TelegramLinkController } from './account/telegram-link.controller';
import { TelegramLinkService } from './account/telegram-link.service';
import { TelegramOnboardingService } from './account/telegram-onboarding.service';
import { TelegramWebLoginController } from './account/telegram-web-login.controller';
import { TelegramWebLoginService } from './account/telegram-web-login.service';
import { TelegramBotService } from './bot/telegram-bot.service';
import { TelegramProfileService } from './bot/telegram-profile.service';
import { TelegramController } from './bot/telegram.controller';
import { TelegramAppsService } from './devices/telegram-apps.service';
import { TelegramDevicesService } from './devices/telegram-devices.service';
import { TelegramWireguardService } from './devices/telegram-wireguard.service';
import { TelegramReferralService } from './invite/telegram-referral.service';
import { TelegramNotifyModule } from './notify';
import { TelegramBroadcastService } from './owner/telegram-broadcast.service';
import { TelegramPromoService } from './owner/telegram-promo.service';
import { TelegramStatsService } from './owner/telegram-stats.service';
import { TelegramSharedService } from './shared/telegram-shared.service';
import { TelegramBillingService } from './subscription/telegram-billing.service';
import { TelegramOffersService } from './subscription/telegram-offers.service';
import { TelegramSubscriptionService } from './subscription/telegram-subscription.service';
import { TelegramSupportService } from './support/telegram-support.service';

@Module({
  imports: [
    AdminModule,
    AuthModule,
    BillingModule,
    ConsentsModule,
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
    TelegramOffersService,
    TelegramOnboardingService,
    TelegramProfileService,
    TelegramPromoService,
    TelegramReferralService,
    TelegramSharedService,
    TelegramStatsService,
    TelegramSubscriptionService,
    TelegramSupportService,
    TelegramWebLoginService,
    TelegramWireguardService
  ]
})
export class TelegramModule {}
