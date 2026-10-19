import { Module } from '@nestjs/common';

import { ReferralsController } from './referrals.controller';
import { ReferralRewardService, ReferralService } from './services';

@Module({
  controllers: [ReferralsController],
  providers: [ReferralService, ReferralRewardService],
  exports: [ReferralService, ReferralRewardService]
})
export class ReferralsModule {}
