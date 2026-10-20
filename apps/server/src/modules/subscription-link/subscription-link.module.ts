import { Module } from '@nestjs/common';

import { DevicesModule } from '../devices';
import { PeersModule } from '../peers';
import { SubscriptionModule } from '../subscription';
import { TelegramNotifyModule } from '../telegram/telegram-notify.module';
import {
  FeedNoticeService,
  NodeTrafficService,
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
  controllers: [SubscriptionLinkController, SubscriptionFeedController, WireguardConfigController],
  providers: [
    FeedNoticeService,
    NodeTrafficService,
    SubscriptionLinkService,
    SubscriptionFeedService,
    SubscriptionPeersService,
    SubscriptionAccessService,
    WireguardConfigService
  ],
  exports: [NodeTrafficService, SubscriptionLinkService, SubscriptionAccessService]
})
export class SubscriptionLinkModule {}
