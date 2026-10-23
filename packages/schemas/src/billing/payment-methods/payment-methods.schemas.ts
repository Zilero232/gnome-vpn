import { z } from 'zod';

import { PAYMENT_METHODS } from './payment-methods.constants';

export const paymentMethodSchema = z.enum(PAYMENT_METHODS);

export const paymentMethodsSchema = z.object({
  methods: z.array(paymentMethodSchema)
});
