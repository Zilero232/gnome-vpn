import { Body, Controller, Get, Post } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

import { CurrentUserId } from '../../common/decorators';
import { ClaimReferralDto, ReferralOverviewDto } from './dto/referrals.dto';
import { ReferralService } from './services';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referrals: ReferralService) {}

  @Get()
  @ZodResponse({ type: ReferralOverviewDto })
  overview(@CurrentUserId() userId: string) {
    return this.referrals.overview(userId);
  }

  @Post('claim')
  @ZodResponse({ type: ReferralOverviewDto })
  async claim(@Body() body: ClaimReferralDto, @CurrentUserId() userId: string) {
    await this.referrals.attribute({ userId, code: body.code, source: 'web' });

    return this.referrals.overview(userId);
  }
}
