import { Body, Controller, Get, Post } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ZodResponse } from 'nestjs-zod';

import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';

import { BuyExtraDevicesDto, BuyGiftDto, CheckoutResultDto, CreateCheckoutDto, PaymentMethodsDto } from './checkout.dto';
import { CheckoutService } from './checkout.service';
import { PaymentMethodsService } from './payment-methods.service';

@Controller('billing')
export class CheckoutController {
  constructor(
    private readonly checkout: CheckoutService,
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
}
