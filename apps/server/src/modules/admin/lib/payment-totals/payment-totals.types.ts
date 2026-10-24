import type { AdminPaymentPage, PaymentStatus } from '@gnomevpn/schemas';

import type { Prisma } from '@/generated';

export type PaymentStatusGroup = {
  status: PaymentStatus;
  _count: { _all: number };
  _sum: { amount: Prisma.Decimal | null };
};

export type PaymentTotals = AdminPaymentPage['totals'];
