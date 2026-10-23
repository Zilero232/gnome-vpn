import { z } from 'zod';

import { planIdSchema } from '../../billing/plans';
import { deviceListSchema } from '../../devices/devices.schemas';
import { periodKindSchema } from '../../subscription/subscription.schemas';
import { adminCountSchema, adminPageInfoSchema, adminPageQuerySchema, adminPeriodSchema, adminUserRefSchema } from '../common/common.schemas';
import { adminPaymentSchema } from '../payments/payments.schemas';
import { adminGiftSchema } from '../promo-codes/promo-codes.schemas';
import { ADMIN_MESSAGE_OUTCOMES, ADMIN_REDEMPTION_KINDS, ADMIN_USER, ADMIN_USER_FILTERS } from './users.constants';

export const adminUserSearchSchema = z.object({
  query: z.string().trim().max(ADMIN_USER.searchMaxLength).default('')
});

export const adminUserFilterSchema = z.object({
  access: periodKindSchema.optional(),
  plan: planIdSchema.optional(),
  autoRenew: z.enum(ADMIN_USER_FILTERS.autoRenew).optional(),
  telegram: z.enum(ADMIN_USER_FILTERS.telegram).optional(),
  email: z.enum(ADMIN_USER_FILTERS.email).optional(),
  period: adminPeriodSchema.default(ADMIN_USER_FILTERS.defaultPeriod)
});

export const adminUserExportSchema = adminUserSearchSchema.extend(adminUserFilterSchema.shape);

export const adminUserQuerySchema = adminPageQuerySchema.extend(adminUserExportSchema.shape);

export const adminTelegramSchema = z.object({
  id: z.string(),
  username: z.string().nullable()
});

export const adminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  hasEmail: z.boolean(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
  access: periodKindSchema,
  currentPeriodEnd: z.string().nullable(),
  plan: planIdSchema.nullable(),
  devices: adminCountSchema,
  telegram: adminTelegramSchema.nullable()
});

export const adminUserPageSchema = z.object({
  items: z.array(adminUserSchema),
  page: adminPageInfoSchema
});

export const adminReferralSchema = z.object({
  user: adminUserRefSchema,
  createdAt: z.string(),
  rewardedAt: z.string().nullable(),
  days: adminCountSchema
});

export const adminRedemptionSchema = z.object({
  code: z.string(),
  kind: z.enum(ADMIN_REDEMPTION_KINDS),
  percent: z.number().int().nullable(),
  days: z.number().int().nullable(),
  createdAt: z.string(),
  consumedAt: z.string().nullable(),
  replacedAt: z.string().nullable()
});

export const adminUserCardSchema = z.object({
  profile: z.object({
    id: z.string(),
    email: z.string(),
    hasEmail: z.boolean(),
    name: z.string(),
    emailVerified: z.boolean(),
    locale: z.string().nullable(),
    createdAt: z.string(),
    telegram: adminTelegramSchema
      .extend({
        linkedAt: z.string(),
        lastSeenAt: z.string().nullable()
      })
      .nullable()
  }),
  subscription: z
    .object({
      access: periodKindSchema,
      plan: planIdSchema,
      currentPeriodEnd: z.string().nullable(),
      cancelAtPeriodEnd: z.boolean(),
      isAutoRenewOn: z.boolean(),
      savedCardTitle: z.string().nullable(),
      extraDevices: adminCountSchema,
      bonusDays: adminCountSchema,
      trialStartedAt: z.string().nullable()
    })
    .nullable(),
  link: z
    .object({
      createdAt: z.string(),
      lastSeenAt: z.string().nullable(),
      lastPlatform: z.string().nullable()
    })
    .nullable(),
  devices: deviceListSchema,
  payments: z.array(adminPaymentSchema),
  referral: z.object({
    code: z.string().nullable(),
    referredBy: adminReferralSchema.nullable(),
    invited: z.array(adminReferralSchema),
    invitedTotal: adminCountSchema
  }),
  redemptions: z.array(adminRedemptionSchema),
  gifts: z.array(adminGiftSchema)
});

export const adminExtendSchema = z.object({
  days: z
    .number('admin.validation.extendDays')
    .int('admin.validation.extendDays')
    .min(ADMIN_USER.extendMinDays, 'admin.validation.extendDays')
    .max(ADMIN_USER.extendMaxDays, 'admin.validation.extendDays')
});

export const adminExtendResultSchema = z.object({
  currentPeriodEnd: z.string()
});

export const adminMessageSchema = z.object({
  text: z.string().trim().min(1, 'admin.validation.messageRequired').max(ADMIN_USER.messageMaxLength, 'admin.validation.messageLength')
});

export const adminMessageResultSchema = z.object({
  outcome: z.enum(ADMIN_MESSAGE_OUTCOMES)
});
