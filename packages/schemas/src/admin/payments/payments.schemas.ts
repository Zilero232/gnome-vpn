import { z } from 'zod';

import { paymentKindSchema, paymentStatusSchema } from '../../billing/payment';
import { planIdSchema } from '../../billing/plans';
import {
  adminAmountSchema,
  adminCountSchema,
  adminPageInfoSchema,
  adminPageQuerySchema,
  adminPeriodSchema,
  adminUserRefSchema
} from '../common/common.schemas';
import { ADMIN_PAYMENTS } from './payments.constants';

export const adminPaymentFilterSchema = z.object({
  status: paymentStatusSchema.optional(),
  kind: paymentKindSchema.optional(),
  plan: planIdSchema.optional(),
  period: adminPeriodSchema.default(ADMIN_PAYMENTS.defaultPeriod)
});

export const adminPaymentQuerySchema = adminPageQuerySchema.extend(adminPaymentFilterSchema.shape);

export const adminPaymentSchema = z.object({
  id: z.string(),
  yookassaPaymentId: z.string(),
  user: adminUserRefSchema.nullable(),
  amount: adminAmountSchema,
  status: paymentStatusSchema,
  kind: paymentKindSchema,
  plan: planIdSchema,
  isAutoCharge: z.boolean(),
  extraDevices: adminCountSchema,
  discountPercent: z.number().int().nullable(),
  promoCode: z.string().nullable(),
  createdAt: z.string(),
  refundRequestedAt: z.string().nullable()
});

export const adminPaymentPageSchema = z.object({
  items: z.array(adminPaymentSchema),
  page: adminPageInfoSchema,
  totals: z.object({
    count: adminCountSchema,
    paid: adminAmountSchema,
    refunded: adminAmountSchema
  })
});
