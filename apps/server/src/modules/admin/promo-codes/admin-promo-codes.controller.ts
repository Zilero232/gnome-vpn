import { Body, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ZodResponse } from 'nestjs-zod';

import type { CurrentAdminUser } from '../shared/admin.types';

import { ADMIN_THROTTLE } from '../shared/admin.config';
import { AdminController, CurrentAdmin } from '../shared/admin.decorators';
import { AdminPromoCodesService } from './admin-promo-codes.service';
import {
  AdminCampaignCodeParamDto,
  AdminCampaignDto,
  AdminCampaignFormDto,
  AdminCampaignPageDto,
  AdminCampaignQueryDto,
  AdminGiftPageDto,
  AdminGiftQueryDto
} from './promo-codes.dto';

@AdminController('admin')
export class AdminPromoCodesController {
  constructor(private readonly promoCodes: AdminPromoCodesService) {}

  @Get('promo-codes')
  @ZodResponse({ type: AdminCampaignPageDto })
  campaigns(@Query() query: AdminCampaignQueryDto) {
    return this.promoCodes.campaignPage(query);
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
    return this.promoCodes.stop({ admin, code: params.code });
  }

  @Get('gifts')
  @ZodResponse({ type: AdminGiftPageDto })
  gifts(@Query() query: AdminGiftQueryDto) {
    return this.promoCodes.giftPage(query);
  }
}
