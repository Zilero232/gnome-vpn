import { z } from 'zod';

import { paymentKindSchema } from '../../billing/payment';
import { planIdSchema } from '../../billing/plans';
import { adminAmountSchema, adminCountSchema, adminUserRefSchema } from '../common/common.schemas';
import { ADMIN_ANALYTICS, ADMIN_ANALYTICS_RANGES } from './analytics.constants';

export const adminAnalyticsRangeSchema = z.enum(ADMIN_ANALYTICS_RANGES);

export const adminAnalyticsQuerySchema = z.object({
  range: adminAnalyticsRangeSchema.default(ADMIN_ANALYTICS.defaultRange)
});

export const adminDaySchema = z.object({
  date: z.iso.date(),
  revenue: adminAmountSchema,
  payments: adminCountSchema,
  signups: adminCountSchema,
  newPaid: adminCountSchema,
  trials: adminCountSchema
});

export const adminRevenueSliceSchema = z.object({
  amount: adminAmountSchema,
  count: adminCountSchema
});

export const adminTopReferrerSchema = z.object({
  user: adminUserRefSchema,
  invited: adminCountSchema,
  rewarded: adminCountSchema,
  days: adminCountSchema
});

export const adminAnalyticsSchema = z.object({
  range: adminAnalyticsRangeSchema,
  days: z.array(adminDaySchema),
  conversion: z.object({
    trials: adminCountSchema,
    converted: adminCountSchema
  }),
  revenueByPlan: z.array(adminRevenueSliceSchema.extend({ plan: planIdSchema })),
  revenueByKind: z.array(adminRevenueSliceSchema.extend({ kind: paymentKindSchema })),
  referrals: z.object({
    invited: adminCountSchema,
    rewarded: adminCountSchema,
    referrerDays: adminCountSchema,
    friendDays: adminCountSchema,
    top: z.array(adminTopReferrerSchema)
  })
});
