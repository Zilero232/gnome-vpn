import { Controller, HttpCode, Post } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';

import { CardService } from '../shared/card.service';
import { BindCardResultDto } from './auto-renew.dto';
import { AutoRenewService } from './auto-renew.service';

@Controller('billing')
export class AutoRenewController {
  constructor(
    private readonly autoRenew: AutoRenewService,
    private readonly card: CardService
  ) {}

  @Post('cancel')
  @HttpCode(204)
  cancelAutoRenew(@CurrentUserId() userId: string) {
    return this.autoRenew.cancelAutoRenew(userId);
  }

  @Post('resume')
  @HttpCode(204)
  resumeAutoRenew(@CurrentUserId() userId: string) {
    return this.autoRenew.resumeAutoRenew(userId);
  }

  @Post('bind-card')
  @ZodResponse({ type: BindCardResultDto })
  bindCard(@CurrentUserId() userId: string) {
    return this.card.bindCard(userId);
  }

  @Post('unbind-card')
  @HttpCode(204)
  unbindCard(@CurrentUserId() userId: string) {
    return this.card.unbindCard(userId);
  }
}
