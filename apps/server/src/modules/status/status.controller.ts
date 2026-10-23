import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Body, Controller, Get, HttpCode, Post, UseInterceptors } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';

import { CONNECTION_CHECK, STATUS_CACHE_TTL_MS } from './config';
import { ConnectionCheckDto, ConnectionResultDto, ServerStatusDto } from './dto/status.dto';
import { ConnectionCheckService, ServerStatusService } from './services';

@Controller('status')
export class StatusController {
  constructor(
    private readonly serverStatus: ServerStatusService,
    private readonly connectionCheck: ConnectionCheckService
  ) {}

  @AllowAnonymous()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(STATUS_CACHE_TTL_MS)
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
