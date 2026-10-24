import { Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ZodResponse } from 'nestjs-zod';

import type { CurrentAdminUser } from '../shared/admin.types';

import { ADMIN_THROTTLE } from '../shared/admin.config';
import { AdminController, CurrentAdmin } from '../shared/admin.decorators';
import { AdminCsvFileDto, AdminIdParamDto } from '../shared/admin.dto';
import { AdminPaymentsService } from './admin-payments.service';
import { AdminPaymentDto, AdminPaymentFilterDto, AdminPaymentPageDto, AdminPaymentQueryDto } from './payments.dto';

@AdminController('admin/payments')
export class AdminPaymentsController {
  constructor(private readonly payments: AdminPaymentsService) {}

  @Get()
  @ZodResponse({ type: AdminPaymentPageDto })
  list(@Query() query: AdminPaymentQueryDto) {
    return this.payments.list(query);
  }

  @Throttle(ADMIN_THROTTLE.export)
  @Get('export')
  @ZodResponse({ type: AdminCsvFileDto })
  exportCsv(@Query() filter: AdminPaymentFilterDto) {
    return this.payments.exportCsv(filter);
  }

  @Throttle(ADMIN_THROTTLE.write)
  @Post(':id/refund')
  @HttpCode(200)
  @ZodResponse({ type: AdminPaymentDto })
  refund(@Param() params: AdminIdParamDto, @CurrentAdmin() admin: CurrentAdminUser) {
    return this.payments.refund({ admin, paymentId: params.id });
  }
}
