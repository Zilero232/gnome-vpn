import type { z } from 'zod';

import type { adminPaymentFilterSchema, adminPaymentPageSchema, adminPaymentQuerySchema, adminPaymentSchema } from './payments.schemas';

export type AdminPaymentFilter = z.input<typeof adminPaymentFilterSchema>;

export type AdminPaymentQuery = z.input<typeof adminPaymentQuerySchema>;

export type AdminPayment = z.infer<typeof adminPaymentSchema>;

export type AdminPaymentPage = z.infer<typeof adminPaymentPageSchema>;
