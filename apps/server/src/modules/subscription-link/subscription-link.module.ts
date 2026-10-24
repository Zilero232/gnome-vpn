import { Module } from '@nestjs/common';

import { DevicesModule } from '../devices';
import { PeersModule } from '../peers';
import { SubscriptionModule } from '../subscription';
import { TelegramNotifyModule } from '../telegram/telegram-notify.module';
import { GeoFilesController } from './geo-files.controller';
import { RoutingSettingsController } from './routing-settings.controller';
import {
  FeedNoticeService,
  GeoFilesService,
  RoutingSettingsService,
  SubscriptionAccessService,
  SubscriptionFeedService,
  SubscriptionLinkService,
  SubscriptionPeersService,
  WireguardConfigService
} from './services';
import { SubscriptionFeedController } from './subscription-feed.controller';
import { SubscriptionLinkController } from './subscription-link.controller';
import { WireguardConfigController } from './wireguard-config.controller';

@Module({
  imports: [DevicesModule, PeersModule, SubscriptionModule, TelegramNotifyModule],
  controllers: [SubscriptionLinkController, SubscriptionFeedController, WireguardConfigController, RoutingSettingsController, GeoFilesController],
  providers: [
    FeedNoticeService,
    SubscriptionLinkService,
    SubscriptionFeedService,
    SubscriptionPeersService,
    SubscriptionAccessService,
    WireguardConfigService,
    RoutingSettingsService,
    GeoFilesService
  ],
  exports: [SubscriptionLinkService, SubscriptionAccessService, WireguardConfigService, GeoFilesService]
})
export class SubscriptionLinkModule {}
