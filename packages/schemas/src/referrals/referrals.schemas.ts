import { z } from 'zod';

import { isShortCode, normaliseShortCode } from '../short-code';

export const referralCodeSchema = z
  .string()
  .max(64, 'validation.referralCodeInvalid')
  .refine(isShortCode, 'validation.referralCodeInvalid')
  .transform(normaliseShortCode);

export const optionalReferralCodeSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || isShortCode(value), 'validation.referralCodeInvalid')
  .transform((value) => (value === '' ? value : normaliseShortCode(value)));

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
  isReferralRewarded: z.boolean(),
  referralRewardedDays: z.number().int().nonnegative(),
  canBeReferred: z.boolean()
});
