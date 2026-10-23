import { z } from 'zod';

import { planIdSchema } from '../../billing/plans';
import { isPromoCode, normalisePromoCode, promoCodeOrigin } from '../../promo-codes/promo-codes';
import { CAMPAIGN_KINDS, PROMO_CODE, PROMO_DAYS, PROMO_DISCOUNT } from '../../promo-codes/promo-codes.constants';
import { adminAmountSchema, adminCountSchema, adminPageInfoSchema, adminUserRefSchema } from '../common/common.schemas';
import { ADMIN_CAMPAIGN_STATES } from './promo-codes.constants';

const EFFECT_RANGE = {
  discount: { min: PROMO_DISCOUNT.minPercent, max: PROMO_DISCOUNT.maxPercent, message: 'admin.validation.percent' },
  days: { min: PROMO_DAYS.min, max: PROMO_DAYS.max, message: 'admin.validation.days' }
} as const;

export const adminCampaignKindSchema = z.enum(CAMPAIGN_KINDS);

export const adminCampaignCodeParamSchema = z.object({
  code: z.string().trim().min(1).max(PROMO_CODE.inputMaxLength)
});

export const adminCampaignFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .max(PROMO_CODE.inputMaxLength, 'admin.validation.codeFormat')
      .refine(isPromoCode, 'admin.validation.codeFormat')
      .refine((code) => promoCodeOrigin(normalisePromoCode(code)) === 'campaign', 'admin.validation.codeShape')
      .transform(normalisePromoCode),
    kind: adminCampaignKindSchema,
    value: z.number('admin.validation.whole').int('admin.validation.whole'),
    maxUses: z
      .number('admin.validation.maxUses')
      .int('admin.validation.maxUses')
      .min(1, 'admin.validation.maxUses')
      .max(PROMO_CODE.maxUses, 'admin.validation.maxUses')
      .nullable(),
    until: z.union([z.literal(''), z.iso.date('admin.validation.until')]).transform((value) => (value === '' ? null : value))
  })
  .superRefine(({ kind, value }, context) => {
    const range = EFFECT_RANGE[kind];

    if (value < range.min || value > range.max) {
      context.addIssue({ code: 'custom', path: ['value'], message: range.message });
    }
  });

export const adminCampaignSchema = z.object({
  id: z.string(),
  code: z.string(),
  kind: adminCampaignKindSchema,
  percent: z.number().int().nullable(),
  days: z.number().int().nullable(),
  maxUses: z.number().int().nullable(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
  state: z.enum(ADMIN_CAMPAIGN_STATES),
  used: adminCountSchema,
  payments: adminCountSchema,
  revenue: adminAmountSchema
});

export const adminCampaignPageSchema = z.object({
  items: z.array(adminCampaignSchema),
  page: adminPageInfoSchema
});

export const adminGiftSchema = z.object({
  id: z.string(),
  code: z.string(),
  plan: planIdSchema.nullable(),
  days: z.number().int().nullable(),
  buyer: adminUserRefSchema.nullable(),
  createdAt: z.string(),
  redeemedAt: z.string().nullable(),
  redeemedBy: adminUserRefSchema.nullable(),
  isRevoked: z.boolean()
});

export const adminGiftPageSchema = z.object({
  items: z.array(adminGiftSchema),
  page: adminPageInfoSchema
});
