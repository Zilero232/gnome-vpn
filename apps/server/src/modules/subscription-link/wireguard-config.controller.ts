import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

import { CurrentUserId } from '@/common/decorators';

import { SubscriptionGuard } from '../subscription';
import { CreateWireguardConfigDto, WireguardConfigFileDto, WireguardConfigParamDto, WireguardOverviewDto } from './dto/wireguard.dto';
import { WireguardConfigService } from './services';

@Controller('wireguard')
export class WireguardConfigController {
  constructor(private readonly wireguard: WireguardConfigService) {}

  @Get()
  @ZodResponse({ type: WireguardOverviewDto })
  overview(@CurrentUserId() userId: string) {
    return this.wireguard.overview(userId);
  }

  @Post('configs')
  @UseGuards(SubscriptionGuard)
  @ZodResponse({ type: WireguardConfigFileDto })
  create(@Body() body: CreateWireguardConfigDto, @CurrentUserId() userId: string) {
    return this.wireguard.create({ userId, nodeId: body.nodeId, name: body.name });
  }

  @Get('configs/:id')
  @UseGuards(SubscriptionGuard)
  @ZodResponse({ type: WireguardConfigFileDto })
  file(@Param() params: WireguardConfigParamDto, @CurrentUserId() userId: string) {
    return this.wireguard.file({ userId, deviceId: params.id });
  }
}
