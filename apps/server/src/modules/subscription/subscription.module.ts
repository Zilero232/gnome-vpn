import { Module } from '@nestjs/common';

import { SubscriptionGuard } from './guards';
import { SubscriptionPeriodService, SubscriptionService, TrialGrantService, TrialService } from './services';
import { SubscriptionController } from './subscription.controller';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionPeriodService, SubscriptionGuard, TrialService, TrialGrantService],
  exports: [SubscriptionService, SubscriptionPeriodService, SubscriptionGuard, TrialService, TrialGrantService]
})
export class SubscriptionModule {}
