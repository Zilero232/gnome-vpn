import type { PlanId } from '@gnomevpn/schemas';

import type { PaymentKind, Prisma } from '@/generated';
import type { RevokeOutcome, RewardOutcome } from '@/modules/referrals';

import type { ACTIVATION_SELECT, PAYMENT_SETTLE_SELECT } from './payment.constants';

export type PaymentRow = Prisma.PaymentGetPayload<{ select: typeof PAYMENT_SETTLE_SELECT }>;

export type ActivationRow = Prisma.SubscriptionGetPayload<{ select: typeof ACTIVATION_SELECT }>;

export type Purchase = { kind: 'extraDevices'; quantity: number } | { kind: 'gift'; planId: PlanId } | { kind: 'subscription'; planId: PlanId };

export type PaymentMethodRef = {
  id: string;
  title: string | null;
};

export type SettleResult = 'canceled' | 'refunded' | 'settled' | 'skipped' | 'unknown' | 'waiting';

export type SettleOutcome = {
  referral: RewardOutcome | null;
  giftCode: string | null;
};

export type RefundReason = 'discountUsed' | 'lapsed' | 'orphan';

export type RefundOutcome = {
  userId: string | null;
  kind: PaymentKind;
  referral: RevokeOutcome | null;
};

export type SubscriptionCharge = 'gift' | 'purchase' | 'renewal';
