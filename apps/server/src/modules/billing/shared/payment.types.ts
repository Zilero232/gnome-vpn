import type { PlanId } from '@gnomevpn/schemas';

import type { Prisma } from '@/generated';
import type { RewardOutcome } from '@/modules/referrals';

import type { PAYMENT_SETTLE_SELECT } from './payment.constants';

export type PaymentRow = Prisma.PaymentGetPayload<{ select: typeof PAYMENT_SETTLE_SELECT }>;

export type Purchase = { kind: 'extraDevices'; quantity: number } | { kind: 'gift'; planId: PlanId } | { kind: 'subscription'; planId: PlanId };

export type SettleOutcome = {
  referral: RewardOutcome | null;
  giftCode: string | null;
};
