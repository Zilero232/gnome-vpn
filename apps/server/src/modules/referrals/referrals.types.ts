import type { PlanId } from '@gnomevpn/schemas';

import type { Prisma, ReferralSource } from '../../../generated';

export type PrismaExecutor = Prisma.TransactionClient;

export type AttributeInput = {
  userId: string;
  code: string;
  source: ReferralSource;
};

export type AttributeResult = {
  referrerId: string;
};

export type AdoptInput = {
  fromUserId: string;
  toUserId: string;
  db: PrismaExecutor;
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
  referrerId: string;
  referrerDays: number;
  friendDays: number;
  isBanked: boolean;
};

export type ExtendInput = {
  userId: string;
  days: number;
  db: PrismaExecutor;
};
