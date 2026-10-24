import { Body, Controller, Get, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ZodResponse } from 'nestjs-zod';

import { CurrentUserId } from '@/common/decorators';

import { PROMO_REDEEM } from './config';
import { GiftListDto, PendingDiscountDto, PromoRedemptionDto, RedeemPromoCodeDto } from './dto/promo-codes.dto';
import { GiftCodeService, PromoDiscountService, PromoRedemptionService } from './services';

@Controller('promo-codes')
export class PromoCodesController {
  constructor(
    private readonly redemption: PromoRedemptionService,
    private readonly discounts: PromoDiscountService,
    private readonly gifts: GiftCodeService
  ) {}

  @Throttle({ default: PROMO_REDEEM.throttle })
  @Post('redeem')
  @ZodResponse({ type: PromoRedemptionDto })
  redeem(@Body() body: RedeemPromoCodeDto, @CurrentUserId() userId: string) {
    return this.redemption.redeem({ userId, code: body.code });
  }

  @Get('discount')
  @ZodResponse({ type: PendingDiscountDto })
  discount(@CurrentUserId() userId: string) {
    return this.discounts.overview(userId);
  }

  @Get('gifts')
  @ZodResponse({ type: GiftListDto })
  giftList(@CurrentUserId() userId: string) {
    return this.gifts.list(userId);
  }
}
