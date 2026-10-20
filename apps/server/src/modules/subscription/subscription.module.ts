import { Module } from '@nestjs/common';

import { SubscriptionGuard } from './guards';
import { SubscriptionService, TrialGrantService, TrialService } from './services';
import { SubscriptionController } from './subscription.controller';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionGuard, TrialService, TrialGrantService],
  exports: [SubscriptionService, SubscriptionGuard, TrialService, TrialGrantService]
})
export class SubscriptionModule {}
