import type { CheckoutLocale, Plan, PlanId } from '@gnomevpn/schemas';

import type { PaymentKind, Prisma } from '../../../generated';
import type { PrismaExecutor } from '../../core';
import type { RevokeOutcome, RewardOutcome } from '../referrals';

export type PaymentMethodRef = {
  id: string;
  title: string | null;
};

export type ActivateInput = {
  userId: string;
  planId: PlanId;
  method: PaymentMethodRef | null;
  orderedAt: Date;
  db?: PrismaExecutor;
};

export type AttachMethodInput = {
  userId: string;
  paymentMethodId: string;
  title: string | null;
};

export type AutoRenewInput = {
  hasMethod: boolean;
  wasCancelled: boolean;
};

export type RecordPaymentInput = {
  userId: string;
  paymentId: string;
  plan: Plan;
  isAutoCharge: boolean;
  paymentMethodId?: string | null;
};

export type GrantExtraDevicesInput = {
  userId: string;
  quantity: number;
  db?: PrismaExecutor;
};

export type CheckoutReturnInput = {
  returnUrl?: string;
  locale?: CheckoutLocale;
};

export type BuyExtraDevicesServiceInput = CheckoutReturnInput & {
  userId: string;
  quantity: number;
};

export type CreateCheckoutServiceInput = CheckoutReturnInput & {
  userId: string;
  planId: PlanId;
};

export type ReusablePaymentInput = {
  userId: string;
  returnUrl: string;
  where: Prisma.PaymentWhereInput;
};

export type RevokePeriodInput = {
  userId: string;
  months: number;
  db: PrismaExecutor;
};

export type SetAutoRenewServiceInput = {
  userId: string;
  isEnabled: boolean;
};

export type BindCardServiceInput = {
  userId: string;
};

export type CanceledPayment = {
  id: string;
  userId: string | null;
  isAutoCharge: boolean;
  paymentId: string;
  reason: string | null;
};

export type SettledPayment = {
  userId: string;
  kind: PaymentKind;
  isAutoCharge: boolean;
  amount: Prisma.Decimal;
};

export type SettleOutcome = {
  referral: RewardOutcome | null;
};

export type SettleResult = 'canceled' | 'refunded' | 'settled' | 'skipped' | 'unknown' | 'waiting';

export type RefundReason = 'lapsed' | 'orphan';

export type UnusablePayment = {
  id: string;
  userId: string | null;
  kind: PaymentKind;
};

export type RefundUnusableInput = {
  id: string;
  paymentId: string;
  amount: Prisma.Decimal;
  reason: RefundReason;
};

export type RefundedPayment = {
  id: string;
  userId: string | null;
  kind: PaymentKind;
  plan: PlanId;
  extraDevices: number;
};

export type RefundOutcome = {
  userId: string;
  kind: PaymentKind;
  referral: RevokeOutcome | null;
};

export type AnnounceReferralInput = {
  friendId: string;
  outcome: RewardOutcome;
};

export type ReverseRefundInput = {
  row: RefundedPayment;
  db: PrismaExecutor;
};
