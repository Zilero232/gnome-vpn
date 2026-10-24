import { Module } from '@nestjs/common';

import { BillingModule } from '../billing';
import { DevicesModule } from '../devices';
import { PromoCodesModule } from '../promo-codes';
import { SubscriptionLinkModule } from '../subscription-link';
import { TelegramNotifyModule } from '../telegram/telegram-notify.module';
import { AdminNodesController } from './nodes/admin-nodes.controller';
import { AdminNodesService } from './nodes/admin-nodes.service';
import { AdminAnalyticsService } from './overview/admin-analytics.service';
import { AdminOverviewController } from './overview/admin-overview.controller';
import { AdminOverviewService } from './overview/admin-overview.service';
import { AdminSeriesService } from './overview/admin-series.service';
import { AdminStatsService } from './overview/admin-stats.service';
import { AdminPaymentsController } from './payments/admin-payments.controller';
import { AdminPaymentsService } from './payments/admin-payments.service';
import { AdminPromoCodesController } from './promo-codes/admin-promo-codes.controller';
import { AdminPromoCodesService } from './promo-codes/admin-promo-codes.service';
import { AdminAccessService } from './shared/admin-access.service';
import { AdminAuditService } from './shared/admin-audit.service';
import { AdminGuard } from './shared/admin.guard';
import { AdminUserActionsService } from './users/admin-user-actions.service';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';

@Module({
  imports: [BillingModule, DevicesModule, PromoCodesModule, SubscriptionLinkModule, TelegramNotifyModule],
  controllers: [AdminOverviewController, AdminUsersController, AdminPaymentsController, AdminPromoCodesController, AdminNodesController],
  providers: [
    AdminGuard,
    AdminAccessService,
    AdminAuditService,
    AdminOverviewService,
    AdminStatsService,
    AdminSeriesService,
    AdminAnalyticsService,
    AdminUsersService,
    AdminUserActionsService,
    AdminPaymentsService,
    AdminPromoCodesService,
    AdminNodesService
  ],
  exports: [AdminStatsService]
})
export class AdminModule {}
