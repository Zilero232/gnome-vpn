import type { z } from 'zod';

import type { referralOverviewSchema } from './referrals.schemas';

export type ReferralReward = {
  referrerDays: number;
  friendDays: number;
};

export type ReferralOverview = z.infer<typeof referralOverviewSchema>;
