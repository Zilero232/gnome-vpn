import type { PlanId } from '@gnomevpn/schemas';

import type { PrismaExecutor } from '@/core';

export type AttributeInput = {
  userId: string;
  code: string;
};

export type AttributeResult = {
  referrerId: string;
};

export type AdoptInput = {
  fromUserId: string;
  toUserId: string;
  db: PrismaExecutor;
};

export type MutualInput = {
  inviterId: string;
  friendId: string;
  db?: PrismaExecutor;
};

export type EligibilityInput = {
  userId: string;
  db?: PrismaExecutor;
};

export type RewardInput = {
  userId: string;
  planId: PlanId;
  paymentId: string;
  db: PrismaExecutor;
};

export type RewardOutcome = {
  referrerId: string | null;
  referrerDays: number;
  friendDays: number;
  isBanked: boolean;
};

export type ReferrerShareInput = {
  referrerId: string;
  planned: number;
  now: Date;
  db: PrismaExecutor;
};

export type ExtendInput = {
  userId: string;
  days: number;
  db: PrismaExecutor;
};

export type RevokeInput = {
  paymentId: string;
  db: PrismaExecutor;
};

export type RevokeOutcome = {
  referrerId: string | null;
  referredId: string | null;
  referrerDays: number;
  friendDays: number;
};
