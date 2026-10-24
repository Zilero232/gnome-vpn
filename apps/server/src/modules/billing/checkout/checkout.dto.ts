import { buyExtraDevicesSchema, buyGiftSchema, checkoutResultSchema, createCheckoutSchema, paymentMethodsSchema } from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class CheckoutResultDto extends createZodDto(checkoutResultSchema) {}

export class CreateCheckoutDto extends createZodDto(createCheckoutSchema) {}

export class BuyExtraDevicesDto extends createZodDto(buyExtraDevicesSchema) {}

export class BuyGiftDto extends createZodDto(buyGiftSchema) {}

export class PaymentMethodsDto extends createZodDto(paymentMethodsSchema) {}
