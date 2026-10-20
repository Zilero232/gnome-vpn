import { z } from 'zod';

import { MAX_EXTRA_DEVICES } from '../addons';
import { planIdSchema } from '../plans';
import { CHECKOUT_LOCALES } from './checkout.constants';

export const checkoutLocaleSchema = z.enum(CHECKOUT_LOCALES);

export const createCheckoutSchema = z.object({
  planId: planIdSchema,
  locale: checkoutLocaleSchema.optional()
});

export const buyExtraDevicesSchema = z.object({
  quantity: z.number().int().min(1).max(MAX_EXTRA_DEVICES),
  locale: checkoutLocaleSchema.optional()
});

export const checkoutResultSchema = z.object({
  confirmationUrl: z.url()
});

export const bindCardResultSchema = z.object({
  confirmationUrl: z.url().nullable(),
  isActive: z.boolean()
});
