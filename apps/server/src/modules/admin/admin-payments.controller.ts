import { Controller, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';

import type { CurrentAdminUser } from './admin.types';

import { ADMIN_THROTTLE } from './config';
import { CurrentAdmin } from './decorators';
import { AdminCsvFileDto, AdminIdParamDto, AdminPaymentDto, AdminPaymentFilterDto, AdminPaymentPageDto, AdminPaymentQueryDto } from './dto/admin.dto';
import { AdminGuard } from './guards';
import { AdminPaymentsService } from './services';

@OptionalAuth()
@UseGuards(AdminGuard)
@Throttle(ADMIN_THROTTLE.read)
@Controller('admin/payments')
export class AdminPaymentsController {
  constructor(private readonly payments: AdminPaymentsService) {}

  @Get()
  @ZodResponse({ type: AdminPaymentPageDto })
  list(@Query() query: AdminPaymentQueryDto) {
    return this.payments.list({ ...query, now: new Date() });
  }

  @Throttle(ADMIN_THROTTLE.export)
  @Get('export')
  @ZodResponse({ type: AdminCsvFileDto })
  exportCsv(@Query() query: AdminPaymentFilterDto) {
    return this.payments.exportCsv({ ...query, now: new Date() });
  }

  @Throttle(ADMIN_THROTTLE.write)
  @Post(':id/refund')
  @HttpCode(200)
  @ZodResponse({ type: AdminPaymentDto })
  refund(@Param() params: AdminIdParamDto, @CurrentAdmin() admin: CurrentAdminUser) {
    return this.payments.refund({ admin, paymentId: params.id });
  }
}
