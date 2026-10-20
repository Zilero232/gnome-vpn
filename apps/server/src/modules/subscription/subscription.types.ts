import type { PeriodKind } from '@gnomevpn/schemas';

import type { PrismaExecutor } from '../../core';

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
