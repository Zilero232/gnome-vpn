import { ADMIN_PAYMENTS, ADMIN_PERIODS, paymentKindSchema, paymentStatusSchema, planIdSchema } from '@gnomevpn/schemas';
import { parseAsStringLiteral } from 'nuqs';

export const PAYMENT_FILTERS = {
  scope: 'payments',
  parsers: {
    period: parseAsStringLiteral(ADMIN_PERIODS).withDefault(ADMIN_PAYMENTS.defaultPeriod),
    status: parseAsStringLiteral(paymentStatusSchema.options),
    kind: parseAsStringLiteral(paymentKindSchema.options),
    plan: parseAsStringLiteral(planIdSchema.options)
  }
} as const;
