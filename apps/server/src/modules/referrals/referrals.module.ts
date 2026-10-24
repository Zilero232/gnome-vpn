import { Module } from '@nestjs/common';

import { SubscriptionModule } from '../subscription';
import { ReferralsController } from './referrals.controller';
import { ReferralRewardService, ReferralService } from './services';

@Module({
  imports: [SubscriptionModule],
  controllers: [ReferralsController],
  providers: [ReferralService, ReferralRewardService],
  exports: [ReferralService, ReferralRewardService]
})
export class ReferralsModule {}
