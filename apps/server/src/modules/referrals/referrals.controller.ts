import { Controller, Get } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

import { CurrentUserId } from '../../common/decorators';
import { ReferralOverviewDto } from './dto/referrals.dto';
import { ReferralService } from './services';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referrals: ReferralService) {}

  @Get()
  @ZodResponse({ type: ReferralOverviewDto })
  overview(@CurrentUserId() userId: string) {
    return this.referrals.overview(userId);
  }
}
