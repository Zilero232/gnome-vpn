import { z } from 'zod';

export const referralOverviewSchema = z.object({
  code: z.string(),
  link: z.url(),
  telegramLink: z.url().nullable(),
  invited: z.number().int().nonnegative(),
  rewarded: z.number().int().nonnegative(),
  daysEarned: z.number().int().nonnegative(),
  pendingDays: z.number().int().nonnegative(),
  isReferred: z.boolean(),
  isReferralRewarded: z.boolean(),
  referralRewardedDays: z.number().int().nonnegative(),
  canBeReferred: z.boolean()
});
