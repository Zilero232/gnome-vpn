import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Body, Controller, Get, HttpCode, Post, UseInterceptors } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';

import { CONNECTION_CHECK, STATUS_PAGE } from './config';
import { ConnectionCheckDto, ConnectionResultDto, ServerStatusDto } from './dto/status.dto';
import { ConnectionCheckService } from './services/connection-check.service';
import { ServerStatusService } from './services/server-status.service';

@Controller('status')
export class StatusController {
  constructor(
    private readonly serverStatus: ServerStatusService,
    private readonly connectionCheck: ConnectionCheckService
  ) {}

  @AllowAnonymous()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(STATUS_PAGE.cacheTtlMs)
  @Get()
  @ZodResponse({ type: ServerStatusDto })
  status() {
    return this.serverStatus.status();
  }

  @AllowAnonymous()
  @Throttle({ default: CONNECTION_CHECK.throttle })
  @Post('check')
  @HttpCode(200)
  @ZodResponse({ type: ConnectionResultDto })
  check(@Body() body: ConnectionCheckDto) {
    return this.connectionCheck.check(body);
  }
}
