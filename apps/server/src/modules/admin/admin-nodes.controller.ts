import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';

import type { CurrentAdminUser } from './admin.types';

import { ADMIN_THROTTLE } from './config';
import { CurrentAdmin } from './decorators';
import { AdminIdParamDto, AdminNodeAvailabilityDto, AdminNodeDto, AdminNodeListDto } from './dto/admin.dto';
import { AdminGuard } from './guards';
import { AdminNodesService } from './services';

@OptionalAuth()
@UseGuards(AdminGuard)
@Throttle(ADMIN_THROTTLE.read)
@Controller('admin/nodes')
export class AdminNodesController {
  constructor(private readonly nodes: AdminNodesService) {}

  @Get()
  @ZodResponse({ type: AdminNodeListDto })
  list() {
    return this.nodes.list(new Date());
  }

  @Throttle(ADMIN_THROTTLE.write)
  @Patch(':id')
  @ZodResponse({ type: AdminNodeDto })
  setAvailability(@Param() params: AdminIdParamDto, @Body() body: AdminNodeAvailabilityDto, @CurrentAdmin() admin: CurrentAdminUser) {
    return this.nodes.setAvailability({ admin, nodeId: params.id, isAvailable: body.isAvailable, now: new Date() });
  }
}
