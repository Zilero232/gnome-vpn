import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';

import type { CurrentAdminUser } from './admin.types';

import { ADMIN_THROTTLE } from './config';
import { CurrentAdmin } from './decorators';
import { AdminAnalyticsDto, AdminAnalyticsQueryDto, AdminOverviewDto, AdminSessionDto } from './dto/admin.dto';
import { AdminGuard } from './guards';
import { AdminAccessService, AdminAnalyticsService, AdminOverviewService } from './services';

@OptionalAuth()
@UseGuards(AdminGuard)
@Throttle(ADMIN_THROTTLE.read)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly access: AdminAccessService,
    private readonly overviews: AdminOverviewService,
    private readonly analytics: AdminAnalyticsService
  ) {}

  @Get('me')
  @ZodResponse({ type: AdminSessionDto })
  me(@CurrentAdmin() admin: CurrentAdminUser) {
    return this.access.session(admin);
  }

  @Get('overview')
  @ZodResponse({ type: AdminOverviewDto })
  overview() {
    return this.overviews.overview(new Date());
  }

  @Get('analytics')
  @ZodResponse({ type: AdminAnalyticsDto })
  analyticsFor(@Query() query: AdminAnalyticsQueryDto) {
    return this.analytics.analytics({ range: query.range, now: new Date() });
  }
}
