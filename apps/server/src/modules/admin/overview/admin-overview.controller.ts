import { Get, Query } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

import type { CurrentAdminUser } from '../shared/admin.types';

import { AdminAccessService } from '../shared/admin-access.service';
import { AdminController, CurrentAdmin } from '../shared/admin.decorators';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminOverviewService } from './admin-overview.service';
import { AdminAnalyticsDto, AdminAnalyticsQueryDto, AdminOverviewDto, AdminSessionDto } from './overview.dto';

@AdminController('admin')
export class AdminOverviewController {
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
    return this.overviews.overview();
  }

  @Get('analytics')
  @ZodResponse({ type: AdminAnalyticsDto })
  analyticsFor(@Query() query: AdminAnalyticsQueryDto) {
    return this.analytics.analytics(query.range);
  }
}
