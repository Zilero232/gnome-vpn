import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

import { CurrentUserId } from '@/common/decorators';

import { RoutingSettingsDto, UpdateRoutingSettingsDto } from './dto/routing-settings.dto';
import { RoutingSettingsService } from './services';

@Controller('subscription-link/routing')
export class RoutingSettingsController {
  constructor(private readonly routing: RoutingSettingsService) {}

  @Get()
  @ZodResponse({ type: RoutingSettingsDto })
  get(@CurrentUserId() userId: string) {
    return this.routing.get(userId);
  }

  @Patch()
  @ZodResponse({ type: RoutingSettingsDto })
  update(@Body() body: UpdateRoutingSettingsDto, @CurrentUserId() userId: string) {
    return this.routing.update({ userId, patch: body });
  }
}
