import { Module } from '@nestjs/common';

import { TelegramNotifyModule } from '@/modules/telegram/notify';

import { BillingModule } from '../billing';
import { DevicesModule } from '../devices';
import { PromoCodesModule } from '../promo-codes';
import { SubscriptionLinkModule } from '../subscription-link';
import { AdminNodesController } from './admin-nodes.controller';
import { AdminPaymentsController } from './admin-payments.controller';
import { AdminPromoCodesController } from './admin-promo-codes.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminController } from './admin.controller';
import { AdminGuard } from './guards';
import {
  AdminAccessService,
  AdminAnalyticsService,
  AdminAuditService,
  AdminNodesService,
  AdminOverviewService,
  AdminPaymentsService,
  AdminPromoCodesService,
  AdminSeriesService,
  AdminStatsService,
  AdminUserActionsService,
  AdminUsersService
} from './services';

@Module({
  imports: [BillingModule, DevicesModule, PromoCodesModule, SubscriptionLinkModule, TelegramNotifyModule],
  controllers: [AdminController, AdminUsersController, AdminPaymentsController, AdminPromoCodesController, AdminNodesController],
  providers: [
    AdminGuard,
    AdminAccessService,
    AdminAnalyticsService,
    AdminAuditService,
    AdminNodesService,
    AdminOverviewService,
    AdminPaymentsService,
    AdminPromoCodesService,
    AdminSeriesService,
    AdminStatsService,
    AdminUserActionsService,
    AdminUsersService
  ],
  exports: [AdminStatsService]
})
export class AdminModule {}
