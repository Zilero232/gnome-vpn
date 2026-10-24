import type { Plan, PlanId } from '@gnomevpn/schemas';

import type { PrismaExecutor } from '@/core';
import type { Prisma } from '@/generated';
import type { PaymentInfo } from '@/lib/yookassa';

import type { PaymentRow, Purchase } from '../shared/payment.types';
import type { ACTIVATION_SELECT } from './webhook.constants';

export type SettleResult = 'canceled' | 'refunded' | 'settled' | 'skipped' | 'unknown' | 'waiting';

export type SettleCheck = 'canceled' | 'grant' | 'refunded' | 'waiting';

export type SettleCheckInput = Pick<PaymentInfo, 'refundedRub' | 'status'>;

export type PurchaseRow = Pick<PaymentRow, 'extraDevices' | 'kind' | 'plan'>;

export type SavedMethodInput = Pick<PaymentInfo, 'paymentMethodId' | 'paymentMethodTitle'>;

export type PaymentMethodRef = {
  id: string;
  title: string | null;
};

export type ActivationRow = Prisma.SubscriptionGetPayload<{ select: typeof ACTIVATION_SELECT }>;

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

export type GrantInput = {
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

export type ActivateInput = {
  userId: string;
  planId: PlanId;
  method: PaymentMethodRef | null;
  orderedAt: Date;
  db: PrismaExecutor;
};
