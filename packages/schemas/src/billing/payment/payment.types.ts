import type { z } from 'zod';

import type { lastPaymentSchema, paymentKindSchema, paymentStatusSchema } from './payment.schemas';

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export type PaymentKind = z.infer<typeof paymentKindSchema>;

export type LastPayment = z.infer<typeof lastPaymentSchema>;
