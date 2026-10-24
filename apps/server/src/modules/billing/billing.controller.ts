import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';

import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';

import {
  BindCardResultDto,
  BuyExtraDevicesDto,
  BuyGiftDto,
  CheckoutResultDto,
  CreateCheckoutDto,
  PaymentMethodsDto,
  WebhookEventDto
} from './dto/billing.dto';
import { WebhookIpGuard } from './guards';
import { AutoRenewService, CardService, CheckoutService, PaymentMethodsService, WebhookService } from './services';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly checkout: CheckoutService,
    private readonly autoRenew: AutoRenewService,
    private readonly card: CardService,
    private readonly webhook: WebhookService,
    private readonly paymentMethods: PaymentMethodsService
  ) {}

  @AllowAnonymous()
  @Get('payment-methods')
  @ZodResponse({ type: PaymentMethodsDto })
  listPaymentMethods() {
    return this.paymentMethods.list();
  }

  @Post('checkout')
  @ZodResponse({ type: CheckoutResultDto })
  async createCheckout(@Body() body: CreateCheckoutDto, @CurrentUserId() userId: string) {
    const { confirmationUrl } = await this.checkout.createCheckout({ userId, planId: body.planId, locale: body.locale });

    return { confirmationUrl };
  }

  @Post('gift')
  @ZodResponse({ type: CheckoutResultDto })
  buyGift(@Body() body: BuyGiftDto, @CurrentUserId() userId: string) {
    return this.checkout.buyGift({ userId, planId: body.planId, locale: body.locale });
  }

  @Post('extra-devices')
  @ZodResponse({ type: CheckoutResultDto })
  buyExtraDevices(@Body() body: BuyExtraDevicesDto, @CurrentUserId() userId: string) {
    return this.checkout.buyExtraDevices({ userId, quantity: body.quantity, locale: body.locale });
  }

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
    return this.card.bindCard({ userId });
  }

  @Post('unbind-card')
  @HttpCode(204)
  unbindCard(@CurrentUserId() userId: string) {
    return this.card.unbindCard(userId);
  }

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
