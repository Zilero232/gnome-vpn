import type { PlanId } from '../billing/plans';
import type { ReferralReward } from './referrals.types';

import { REFERRAL_CODE, REFERRAL_REWARDS } from './referrals.constants';

const CODE_SHAPE = new RegExp(`^[${REFERRAL_CODE.alphabet}]{${REFERRAL_CODE.length}}$`, 'u');

export const normaliseReferralCode = (raw: string): string => raw.trim().toUpperCase().replaceAll(/\s+/gu, '');

export const isReferralCode = (raw: string): boolean => CODE_SHAPE.test(normaliseReferralCode(raw));

export const referralReward = (planId: PlanId): ReferralReward => REFERRAL_REWARDS[planId];
