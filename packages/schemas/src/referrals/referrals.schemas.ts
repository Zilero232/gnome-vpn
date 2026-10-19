import { z } from 'zod';

import { isReferralCode, normaliseReferralCode } from './referrals';

export const referralCodeSchema = z
  .string()
  .max(64, 'validation.referralCodeInvalid')
  .refine(isReferralCode, 'validation.referralCodeInvalid')
  .transform(normaliseReferralCode);

export const claimReferralSchema = z.object({
  code: referralCodeSchema
});

export const referralOverviewSchema = z.object({
  code: z.string(),
  link: z.url(),
  telegramLink: z.url().nullable(),
  invited: z.number().int().nonnegative(),
  rewarded: z.number().int().nonnegative(),
  daysEarned: z.number().int().nonnegative(),
  pendingDays: z.number().int().nonnegative(),
  isReferred: z.boolean(),
  canBeReferred: z.boolean()
});
