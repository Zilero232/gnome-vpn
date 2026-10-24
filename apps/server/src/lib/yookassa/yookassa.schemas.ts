import { z } from 'zod';

import { YOOKASSA_STATUS } from './yookassa.constants';

const amountSchema = z.object({
  value: z.string(),
  currency: z.string()
});

const cardSchema = z.object({
  last4: z.string().nullish(),
  card_type: z.string().nullish()
});

const confirmationSchema = z.object({
  confirmation_url: z.string().nullish(),
  return_url: z.string().nullish()
});

export const paymentResponseSchema = z.object({
  id: z.string(),
  status: z.enum(YOOKASSA_STATUS.payment),
  amount: amountSchema.nullish(),
  refunded_amount: amountSchema.nullish(),
  confirmation: confirmationSchema.nullish(),
  payment_method: z
    .object({
      id: z.string().nullish(),
      saved: z.boolean().nullish(),
      title: z.string().nullish(),
      card: cardSchema.nullish()
    })
    .nullish(),
  cancellation_details: z
    .object({
      party: z.string().nullish(),
      reason: z.string().nullish()
    })
    .nullish()
});

export const refundResponseSchema = z.object({
  id: z.string(),
  payment_id: z.string(),
  status: z.enum(YOOKASSA_STATUS.refund),
  amount: amountSchema
});

export const paymentMethodResponseSchema = z.object({
  id: z.string(),
  status: z.enum(YOOKASSA_STATUS.paymentMethod),
  saved: z.boolean().nullish(),
  title: z.string().nullish(),
  card: cardSchema.nullish(),
  confirmation: confirmationSchema.nullish()
});

export const shopSettingsResponseSchema = z.object({
  payment_methods: z.array(z.string()).nullish()
});
