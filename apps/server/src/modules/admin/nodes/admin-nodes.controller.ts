import { Body, Get, Param, Patch } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ZodResponse } from 'nestjs-zod';

import type { CurrentAdminUser } from '../shared/admin.types';

import { ADMIN_THROTTLE } from '../shared/admin.config';
import { AdminController, CurrentAdmin } from '../shared/admin.decorators';
import { AdminIdParamDto } from '../shared/admin.dto';
import { AdminNodesService } from './admin-nodes.service';
import { AdminNodeAvailabilityDto, AdminNodeDto, AdminNodeListDto } from './nodes.dto';

@AdminController('admin/nodes')
export class AdminNodesController {
  constructor(private readonly nodes: AdminNodesService) {}

  @Get()
  @ZodResponse({ type: AdminNodeListDto })
  list() {
    return this.nodes.list();
  }

  @Throttle(ADMIN_THROTTLE.write)
  @Patch(':id')
  @ZodResponse({ type: AdminNodeDto })
  setAvailability(@Param() params: AdminIdParamDto, @Body() body: AdminNodeAvailabilityDto, @CurrentAdmin() admin: CurrentAdminUser) {
    return this.nodes.setAvailability({ admin, nodeId: params.id, isAvailable: body.isAvailable });
  }
}
