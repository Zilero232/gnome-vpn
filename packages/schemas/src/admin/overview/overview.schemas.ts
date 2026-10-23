import { z } from 'zod';

import { planIdSchema } from '../../billing/plans';
import { adminAmountSchema, adminCountSchema } from '../common/common.schemas';

export const adminShareSchema = z.object({
  label: z.string().nullable(),
  isOther: z.boolean(),
  count: adminCountSchema
});

export const adminNodeTallySchema = z.object({
  up: adminCountSchema,
  degraded: adminCountSchema,
  down: adminCountSchema,
  off: adminCountSchema
});

export const adminOverviewSchema = z.object({
  users: z.object({
    total: adminCountSchema,
    day: adminCountSchema,
    week: adminCountSchema
  }),
  subscriptions: z.object({
    paid: z.array(z.object({ plan: planIdSchema, count: adminCountSchema })),
    trials: adminCountSchema,
    autoRenew: adminCountSchema
  }),
  payments: z.object({
    days: z.number().int().positive(),
    count: adminCountSchema,
    amount: adminAmountSchema
  }),
  devices: adminCountSchema,
  chats: adminCountSchema,
  nodes: adminNodeTallySchema,
  trend: z.object({
    dates: z.array(z.iso.date()),
    revenue: z.array(adminAmountSchema),
    signups: z.array(adminCountSchema)
  }),
  devicesBy: z.object({
    platform: z.array(adminShareSchema),
    app: z.array(adminShareSchema)
  })
});
