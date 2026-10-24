import type { adminPaymentFilterSchema, AdminPaymentPage, adminPaymentQuerySchema, PaymentStatus } from '@gnomevpn/schemas';
import type { z } from 'zod';

import type { Prisma } from '@/generated';

import type { CurrentAdminUser } from '../shared/admin.types';

export type PaymentFilter = z.output<typeof adminPaymentFilterSchema>;

export type PaymentQuery = z.output<typeof adminPaymentQuerySchema>;

export type PaymentWhereInput = {
  filter: PaymentFilter;
  now: Date;
};

export type PaymentStatusGroup = {
  status: PaymentStatus;
  _count: { _all: number };
  _sum: { amount: Prisma.Decimal | null };
};

export type PaymentTotals = AdminPaymentPage['totals'];

export type RefundActionInput = {
  admin: CurrentAdminUser;
  paymentId: string;
};
