import type { z } from 'zod';

import type { paymentMethodSchema, paymentMethodsSchema } from './payment-methods.schemas';

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export type PaymentMethods = z.infer<typeof paymentMethodsSchema>;
