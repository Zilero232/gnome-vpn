import { giftListSchema, pendingDiscountSchema, promoRedemptionSchema, redeemPromoCodeSchema } from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class RedeemPromoCodeDto extends createZodDto(redeemPromoCodeSchema) {}

export class PromoRedemptionDto extends createZodDto(promoRedemptionSchema) {}

export class PendingDiscountDto extends createZodDto(pendingDiscountSchema) {}

export class GiftListDto extends createZodDto(giftListSchema) {}
