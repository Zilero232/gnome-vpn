import type { PeriodKind } from '@gnomevpn/schemas';

import type { PrismaExecutor } from '@/core';

export type TrialState = {
  period: PeriodKind;
  isTrialAvailable: boolean;
};

export type TrialRow = {
  currentPeriodEnd: Date | null;
  trialStartedAt: Date | null;
};

export type TrialEligibility = 'available' | 'emailUnverified' | 'used';

export type TrialStanding = {
  eligibility: TrialEligibility;
  hasAccess: boolean;
};

export type TrialGrantLookupInput = {
  userId: string;
  db?: PrismaExecutor;
};

export type RecordTrialGrantInput = {
  userId: string;
  db?: PrismaExecutor;
  isStrict: boolean;
};

export type TransferTrialInput = {
  fromUserId: string;
  toUserId: string;
  db: PrismaExecutor;
};

export type PeriodDaysInput = {
  userId: string;
  days: number;
  db: PrismaExecutor;
};

export type ExtendAccessInput = PeriodDaysInput & {
  now: Date;
};

export type RewindInput = {
  userId: string;
  months?: number;
  days?: number;
  stopsRenewal?: boolean;
  db: PrismaExecutor;
};

export type ExtraDevicesChangeInput = {
  userId: string;
  quantity: number;
  db: PrismaExecutor;
};
