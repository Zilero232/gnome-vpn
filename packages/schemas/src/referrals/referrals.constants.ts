import type { PlanId } from '../billing/plans';
import type { ReferralReward } from './referrals.types';

export const REFERRAL_REWARDS = {
  monthly: { referrerDays: 7, friendDays: 3 },
  halfYearly: { referrerDays: 15, friendDays: 7 },
  yearly: { referrerDays: 30, friendDays: 15 }
} as const satisfies Record<PlanId, ReferralReward>;

export const MAX_REFERRER_DAYS = Math.max(...Object.values(REFERRAL_REWARDS).map((reward) => reward.referrerDays));

export const MAX_FRIEND_DAYS = Math.max(...Object.values(REFERRAL_REWARDS).map((reward) => reward.friendDays));

export const REFERRAL_CODE = {
  param: 'ref'
} as const;

export const REFERRAL_POLICY = {
  claimWindowDays: 7,
  capDays: 90,
  capWindowDays: 30
} as const;
