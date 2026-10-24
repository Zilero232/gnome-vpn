import type { PrismaExecutor } from '@/core';
import type { PaymentKind, Prisma } from '@/generated';
import type { RevokeOutcome } from '@/modules/referrals';

import type { PaymentRow, Purchase } from '../shared/payment.types';

export type RefundReason = 'discountUsed' | 'lapsed' | 'orphan';

export type RefundOutcome = {
  userId: string | null;
  kind: PaymentKind;
  referral: RevokeOutcome | null;
};

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

export type ReversePurchaseInput = {
  row: PaymentRow;
  purchase: Purchase;
  db: PrismaExecutor;
};
