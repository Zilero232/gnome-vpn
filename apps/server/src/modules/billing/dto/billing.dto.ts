import {
  bindCardResultSchema,
  buyExtraDevicesSchema,
  buyGiftSchema,
  checkoutResultSchema,
  createCheckoutSchema,
  paymentMethodsSchema,
  webhookEventSchema
} from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class CheckoutResultDto extends createZodDto(checkoutResultSchema) {}

export class CreateCheckoutDto extends createZodDto(createCheckoutSchema) {}

export class WebhookEventDto extends createZodDto(webhookEventSchema) {}

export class BindCardResultDto extends createZodDto(bindCardResultSchema) {}

export class BuyExtraDevicesDto extends createZodDto(buyExtraDevicesSchema) {}

export class BuyGiftDto extends createZodDto(buyGiftSchema) {}

export class PaymentMethodsDto extends createZodDto(paymentMethodsSchema) {}
