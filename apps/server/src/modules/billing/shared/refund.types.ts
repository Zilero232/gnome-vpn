import type { Prisma } from '@/generated';

import type { PaymentRow, Purchase, RefundReason } from './payment.types';

export type RefundReasonInput = {
  userId: string | null;
  purchase: Purchase;
  currentPeriodEnd: Date | null;
  now: Date;
};

export type PartialRefundInput = {
  refundedRub: number;
  amount: Prisma.Decimal;
};

export type UnusableReasonInput = {
  userId: string | null;
  purchase: Purchase;
};

export type RefundUnusableInput = {
  row: PaymentRow;
  reason: RefundReason;
};
