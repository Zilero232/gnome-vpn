import type { z } from 'zod';

import type { claimReferralSchema, referralOverviewSchema } from './referrals.schemas';

export type ReferralReward = {
  referrerDays: number;
  friendDays: number;
};

export type ClaimReferralInput = z.infer<typeof claimReferralSchema>;

export type ReferralOverview = z.infer<typeof referralOverviewSchema>;
