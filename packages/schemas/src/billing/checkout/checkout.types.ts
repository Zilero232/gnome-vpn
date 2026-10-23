import type { z } from 'zod';

import type {
  bindCardResultSchema,
  buyExtraDevicesSchema,
  buyGiftSchema,
  checkoutLocaleSchema,
  checkoutResultSchema,
  createCheckoutSchema
} from './checkout.schemas';

export type CheckoutResult = z.infer<typeof checkoutResultSchema>;

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

export type BindCardResult = z.infer<typeof bindCardResultSchema>;

export type BuyExtraDevicesInput = z.infer<typeof buyExtraDevicesSchema>;

export type BuyGiftInput = z.infer<typeof buyGiftSchema>;

export type CheckoutLocale = z.infer<typeof checkoutLocaleSchema>;
