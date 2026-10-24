import { Body, Controller, Get, HttpCode, Post, Put, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';

import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';

import { UNSUBSCRIBE } from './config';
import {
  ConsentStateDto,
  RecordPersonalDataConsentDto,
  UnsubscribeQueryDto,
  UnsubscribeResultDto,
  UpdateMarketingConsentDto
} from './dto/consents.dto';
import { ConsentService, UnsubscribeService } from './services';

@Controller('consents')
export class ConsentsController {
  constructor(
    private readonly consents: ConsentService,
    private readonly unsubscribes: UnsubscribeService
  ) {}

  @Get()
  @ZodResponse({ type: ConsentStateDto })
  state(@CurrentUserId() userId: string) {
    return this.consents.state(userId);
  }

  @Put('marketing')
  @ZodResponse({ type: ConsentStateDto })
  setMarketing(@Body() body: UpdateMarketingConsentDto, @CurrentUserId() userId: string) {
    return this.consents.setMarketing({ userId, granted: body.granted, source: body.source });
  }

  @Post('personal-data')
  @HttpCode(200)
  @ZodResponse({ type: ConsentStateDto })
  recordPersonalData(@Body() body: RecordPersonalDataConsentDto, @CurrentUserId() userId: string) {
    return this.consents.recordPersonalData({ userId, version: body.version, source: body.source });
  }

  @AllowAnonymous()
  @Throttle({ default: UNSUBSCRIBE.throttle })
  @Get('unsubscribe')
  @ZodResponse({ type: UnsubscribeResultDto })
  unsubscribe(@Query() query: UnsubscribeQueryDto) {
    return this.unsubscribes.unsubscribe(query.token);
  }
}
