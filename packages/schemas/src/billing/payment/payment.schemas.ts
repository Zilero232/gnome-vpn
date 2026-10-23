import { z } from 'zod';

export const paymentStatusSchema = z.enum(['pending', 'succeeded', 'canceled', 'refunded']);

export const paymentKindSchema = z.enum(['subscription', 'extraDevices', 'gift']);

export const lastPaymentSchema = z.object({
  status: paymentStatusSchema,
  kind: paymentKindSchema,
  isAutoCharge: z.boolean(),
  createdAt: z.string()
});
