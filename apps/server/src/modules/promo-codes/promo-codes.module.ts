import { Module } from '@nestjs/common';

import { ReferralsModule } from '../referrals';
import { SubscriptionModule } from '../subscription';
import { SubscriptionLinkModule } from '../subscription-link';
import { PromoCodesController } from './promo-codes.controller';
import { AutoDiscountService, GiftCodeService, PromoCampaignService, PromoDiscountService, PromoRedemptionService } from './services';

@Module({
  imports: [ReferralsModule, SubscriptionModule, SubscriptionLinkModule],
  controllers: [PromoCodesController],
  providers: [PromoRedemptionService, PromoCampaignService, PromoDiscountService, GiftCodeService, AutoDiscountService],
  exports: [PromoRedemptionService, PromoCampaignService, PromoDiscountService, GiftCodeService, AutoDiscountService]
})
export class PromoCodesModule {}
