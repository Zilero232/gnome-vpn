import type { Plan, PlanId } from '@gnomevpn/schemas';

import type { PrismaExecutor } from '@/core';
import type { PaymentInfo } from '@/lib/yookassa';
import type { AppliedDiscount } from '@/modules/promo-codes';

import type { ActivationRow, PaymentMethodRef, PaymentRow, Purchase } from './payment.types';

export type SettleCheck = 'canceled' | 'grant' | 'refunded' | 'waiting';

export type SettleCheckInput = Pick<PaymentInfo, 'refundedRub' | 'status'>;

export type SavedMethodInput = Pick<PaymentInfo, 'paymentMethodId' | 'paymentMethodTitle'>;

export type PurchaseRow = Pick<PaymentRow, 'extraDevices' | 'kind' | 'plan'>;

export type ActivationInput = {
  subscription: ActivationRow | null;
  plan: Plan;
  method: PaymentMethodRef | null;
  orderedAt: Date;
  isRecurringEnabled: boolean;
};

export type ActivationData = {
  plan: PlanId;
  currentPeriodEnd: Date;
  bonusDays: number;
  extraDevices?: number;
  cancelAtPeriodEnd: boolean;
  savedCardId?: string;
  savedCardTitle?: string | null;
};

export type CancelInput = {
  row: PaymentRow;
  reason: string | null;
};

export type ClaimAndGrantInput = {
  row: PaymentRow;
  userId: string;
  purchase: Purchase;
  payment: PaymentInfo;
  db: PrismaExecutor;
};

export type GrantPurchaseInput = {
  row: PaymentRow;
  userId: string;
  purchase: Purchase;
  method: PaymentMethodRef | null;
  db: PrismaExecutor;
};

export type RevokePurchaseInput = {
  row: PaymentRow;
  purchase: Purchase;
  db: PrismaExecutor;
};

export type ActivateInput = {
  userId: string;
  planId: PlanId;
  method: PaymentMethodRef | null;
  orderedAt: Date;
  db: PrismaExecutor;
};

export type RecordPendingInput = {
  userId: string;
  paymentId: string;
  plan: Plan;
  amountRub: number;
  kind: 'gift' | 'subscription';
  isAutoCharge: boolean;
  paymentMethodId?: string | null;
  discount?: AppliedDiscount | null;
};
