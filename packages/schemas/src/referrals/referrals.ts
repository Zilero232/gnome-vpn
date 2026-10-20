import type { PlanId } from '../billing/plans';
import type { ReferralReward } from './referrals.types';

import { REFERRAL_REWARDS } from './referrals.constants';

export const referralReward = (planId: PlanId): ReferralReward => REFERRAL_REWARDS[planId];
