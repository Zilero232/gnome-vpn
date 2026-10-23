import { z } from 'zod';

import { planIdSchema } from '../billing/plans';
import { isPromoCode, normalisePromoCode } from './promo-codes';
import { PROMO_CODE, PROMO_REDEMPTION_KINDS } from './promo-codes.constants';

export const promoCodeSchema = z
  .string()
  .max(PROMO_CODE.inputMaxLength, 'validation.promoCodeInvalid')
  .refine(isPromoCode, 'validation.promoCodeInvalid')
  .transform(normalisePromoCode);

export const optionalPromoCodeSchema = z
  .string()
  .trim()
  .max(PROMO_CODE.inputMaxLength, 'validation.promoCodeInvalid')
  .refine((value) => value === '' || isPromoCode(value), 'validation.promoCodeInvalid')
  .transform((value) => (value === '' ? value : normalisePromoCode(value)));

export const redeemPromoCodeSchema = z.object({
  code: promoCodeSchema
});

export const promoRedemptionSchema = z.object({
  kind: z.enum(PROMO_REDEMPTION_KINDS),
  percent: z.number().int().positive().nullable(),
  days: z.number().int().positive().nullable(),
  currentPeriodEnd: z.string().nullable()
});

export const promoDiscountSchema = z.object({
  code: z.string(),
  percent: z.number().int().positive()
});

export const pendingDiscountSchema = z.object({
  discount: promoDiscountSchema.nullable()
});

export const giftSchema = z.object({
  code: z.string(),
  link: z.url(),
  plan: planIdSchema,
  days: z.number().int().positive(),
  purchasedAt: z.string(),
  redeemedAt: z.string().nullable(),
  revokedAt: z.string().nullable()
});

export const giftListSchema = z.object({
  gifts: z.array(giftSchema),
  pendingCount: z.number().int().nonnegative()
});
