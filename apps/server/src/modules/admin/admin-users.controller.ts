import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';

import type { CurrentAdminUser } from './admin.types';

import { ADMIN_THROTTLE } from './config';
import { CurrentAdmin } from './decorators';
import {
  AdminCsvFileDto,
  AdminDeviceParamDto,
  AdminExtendDto,
  AdminExtendResultDto,
  AdminIdParamDto,
  AdminMessageDto,
  AdminMessageResultDto,
  AdminUserCardDto,
  AdminUserExportDto,
  AdminUserPageDto,
  AdminUserQueryDto
} from './dto/admin.dto';
import { AdminGuard } from './guards';
import { AdminUserActionsService, AdminUsersService } from './services';

@OptionalAuth()
@UseGuards(AdminGuard)
@Throttle(ADMIN_THROTTLE.read)
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    private readonly users: AdminUsersService,
    private readonly actions: AdminUserActionsService
  ) {}

  @Get()
  @ZodResponse({ type: AdminUserPageDto })
  list(@Query() { page, query, ...filter }: AdminUserQueryDto) {
    return this.users.list({ page, query, filter, now: new Date() });
  }

  @Throttle(ADMIN_THROTTLE.export)
  @Get('export')
  @ZodResponse({ type: AdminCsvFileDto })
  exportCsv(@Query() { query, ...filter }: AdminUserExportDto) {
    return this.users.exportCsv({ query, filter, now: new Date() });
  }

  @Get(':id')
  @ZodResponse({ type: AdminUserCardDto })
  card(@Param() params: AdminIdParamDto) {
    return this.users.card({ userId: params.id, now: new Date() });
  }

  @Throttle(ADMIN_THROTTLE.write)
  @Post(':id/extend')
  @HttpCode(200)
  @ZodResponse({ type: AdminExtendResultDto })
  extend(@Param() params: AdminIdParamDto, @Body() body: AdminExtendDto, @CurrentAdmin() admin: CurrentAdminUser) {
    return this.actions.extend({ admin, userId: params.id, days: body.days });
  }

  @Throttle(ADMIN_THROTTLE.write)
  @Post(':id/auto-renew/cancel')
  @HttpCode(204)
  cancelAutoRenew(@Param() params: AdminIdParamDto, @CurrentAdmin() admin: CurrentAdminUser) {
    return this.actions.cancelAutoRenew({ admin, userId: params.id });
  }

  @Throttle(ADMIN_THROTTLE.write)
  @Delete(':id/devices/:deviceId')
  @HttpCode(204)
  removeDevice(@Param() params: AdminDeviceParamDto, @CurrentAdmin() admin: CurrentAdminUser) {
    return this.actions.removeDevice({ admin, userId: params.id, deviceId: params.deviceId });
  }

  @Throttle(ADMIN_THROTTLE.write)
  @Post(':id/message')
  @HttpCode(200)
  @ZodResponse({ type: AdminMessageResultDto })
  message(@Param() params: AdminIdParamDto, @Body() body: AdminMessageDto, @CurrentAdmin() admin: CurrentAdminUser) {
    return this.actions.message({ admin, userId: params.id, text: body.text });
  }

  @Throttle(ADMIN_THROTTLE.write)
  @Post(':id/verify-email')
  @HttpCode(204)
  verifyEmail(@Param() params: AdminIdParamDto, @CurrentAdmin() admin: CurrentAdminUser) {
    return this.actions.verifyEmail({ admin, userId: params.id });
  }

  @Throttle(ADMIN_THROTTLE.write)
  @Post(':id/link/rotate')
  @HttpCode(204)
  rotateLink(@Param() params: AdminIdParamDto, @CurrentAdmin() admin: CurrentAdminUser) {
    return this.actions.rotateLink({ admin, userId: params.id });
  }
}
