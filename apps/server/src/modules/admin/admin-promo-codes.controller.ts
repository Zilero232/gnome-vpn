import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';

import type { CurrentAdminUser } from './admin.types';

import { ADMIN_THROTTLE } from './config';
import { CurrentAdmin } from './decorators';
import {
  AdminCampaignCodeParamDto,
  AdminCampaignDto,
  AdminCampaignFormDto,
  AdminCampaignPageDto,
  AdminGiftPageDto,
  AdminPageQueryDto
} from './dto/admin.dto';
import { AdminGuard } from './guards';
import { AdminPromoCodesService } from './services';

@OptionalAuth()
@UseGuards(AdminGuard)
@Throttle(ADMIN_THROTTLE.read)
@Controller('admin')
export class AdminPromoCodesController {
  constructor(private readonly promoCodes: AdminPromoCodesService) {}

  @Get('promo-codes')
  @ZodResponse({ type: AdminCampaignPageDto })
  campaigns(@Query() query: AdminPageQueryDto) {
    return this.promoCodes.campaignPage({ page: query.page, now: new Date() });
  }

  @Throttle(ADMIN_THROTTLE.write)
  @Post('promo-codes')
  @ZodResponse({ status: 201, type: AdminCampaignDto })
  create(@Body() body: AdminCampaignFormDto, @CurrentAdmin() admin: CurrentAdminUser) {
    return this.promoCodes.create({ admin, input: body });
  }

  @Throttle(ADMIN_THROTTLE.write)
  @Post('promo-codes/:code/stop')
  @HttpCode(204)
  stop(@Param() params: AdminCampaignCodeParamDto, @CurrentAdmin() admin: CurrentAdminUser) {
    return this.promoCodes.stop({ admin, code: params.code, now: new Date() });
  }

  @Get('gifts')
  @ZodResponse({ type: AdminGiftPageDto })
  gifts(@Query() query: AdminPageQueryDto) {
    return this.promoCodes.giftPage({ page: query.page, now: new Date() });
  }
}
