import type { Plan, PlanId, PromoDiscount } from '@gnomevpn/schemas';

import type { PromoCodeKind, ReferralSource } from '../../../generated';
import type { PrismaExecutor } from '../../core';
import type { GiftPayment, PromoEffect } from './lib';

export type RedeemInput = {
  userId: string;
  code: string;
  source?: ReferralSource;
};

export type ClaimInput = {
  userId: string;
  code: string;
  identities: string[];
  now: Date;
  db: PrismaExecutor;
};

export type Claimed = {
  effect: PromoEffect;
  currentPeriodEnd: Date | null;
};

export type ExtendAccessInput = {
  userId: string;
  days: number;
  now: Date;
  db: PrismaExecutor;
};

export type AppliedDiscount = PromoDiscount & {
  promoCodeId: string;
};

export type PendingDiscountInput = {
  userId: string;
  db?: PrismaExecutor;
};

export type QuoteInput = {
  userId: string;
  planId: PlanId;
};

export type CheckoutQuote = {
  plan: Plan;
  amountRub: number;
  discount: AppliedDiscount | null;
};

export type DiscountClaimInput = {
  userId: string;
  promoCodeId: string;
  paymentId: string;
  db: PrismaExecutor;
};

export type IssueGiftInput = {
  payment: GiftPayment;
  db: PrismaExecutor;
};

export type RevokeGiftInput = {
  paymentId: string;
  db: PrismaExecutor;
};

export type RevokedGift = {
  redeemerId: string | null;
  days: number;
};

export type PromoCampaign = {
  id: string;
  code: string;
  kind: PromoCodeKind;
  percent: number | null;
  days: number | null;
  maxUses: number | null;
  expiresAt: Date | null;
  createdAt: Date;
};

export type CampaignSummary = PromoCampaign & {
  used: number;
};

export type StopCampaignInput = {
  code: string;
  now: Date;
};
