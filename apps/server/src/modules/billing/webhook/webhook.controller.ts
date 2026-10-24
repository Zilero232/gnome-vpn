import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

import { WebhookIpGuard } from './webhook-ip.guard';
import { WebhookEventDto } from './webhook.dto';
import { WebhookService } from './webhook.service';

@Controller('billing')
export class WebhookController {
  constructor(private readonly webhook: WebhookService) {}

  @AllowAnonymous()
  @SkipThrottle()
  @UseGuards(WebhookIpGuard)
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: WebhookEventDto) {
    await this.webhook.handleWebhook(body);

    return { received: true };
  }
}
