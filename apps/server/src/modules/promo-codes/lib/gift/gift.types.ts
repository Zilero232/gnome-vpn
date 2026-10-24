import type { Gift, PlanId } from '@gnomevpn/schemas';

import type { PaymentKind } from '@/generated';

export type GiftPayment = {
  id: string;
  kind: PaymentKind;
  plan: PlanId;
  userId: string | null;
};

export type GiftToIssueInput = {
  payment: GiftPayment;
  existing: { code: string } | null;
};

export type GiftDraft = {
  kind: 'gift';
  plan: PlanId;
  days: number;
  maxUses: number;
  buyerId: string | null;
  paymentId: string;
};

export type GiftRow = {
  code: string;
  plan: PlanId | null;
  days: number | null;
  createdAt: Date;
  expiresAt: Date | null;
  redemptions: { createdAt: Date }[];
};

export type GiftViewInput = {
  row: GiftRow;
  link: string;
};

export type GiftView = Gift;
