import { describe, expect, it } from 'vitest';

import { PLANS } from '../../billing/plans';
import { referralReward } from '../referrals';
import { MAX_FRIEND_DAYS, MAX_REFERRER_DAYS } from '../referrals.constants';
import { claimReferralSchema } from '../referrals.schemas';

describe('claimReferralSchema', () => {
  it('normalises the code it accepts', () => {
    expect(claimReferralSchema.parse({ code: ' abcd ef23' })).toEqual({ code: 'ABCDEF23' });
  });

  it('refuses a malformed code', () => {
    expect(claimReferralSchema.safeParse({ code: 'nope' }).success).toBe(false);
    expect(claimReferralSchema.safeParse({ code: 42 }).success).toBe(false);
  });
});

describe('referralReward', () => {
  it('rewards every plan on both sides', () => {
    for (const plan of PLANS) {
      const reward = referralReward(plan.id);

      expect(reward.referrerDays).toBeGreaterThan(0);
      expect(reward.friendDays).toBeGreaterThan(0);
    }
  });

  it('gives the referrer more than the friend, who also gets what they paid for', () => {
    for (const plan of PLANS) {
      const reward = referralReward(plan.id);

      expect(reward.referrerDays).toBeGreaterThan(reward.friendDays);
    }
  });

  it('rewards a longer plan at least as much as a shorter one', () => {
    const byLength = [...PLANS].sort((left, right) => left.months - right.months);

    for (const [index, plan] of byLength.slice(1).entries()) {
      expect(referralReward(plan.id).referrerDays).toBeGreaterThanOrEqual(referralReward(byLength[index].id).referrerDays);
    }
  });
});

describe('MAX_REFERRER_DAYS', () => {
  it('is the largest bonus an inviter can get for one friend', () => {
    expect(MAX_REFERRER_DAYS).toBe(Math.max(...PLANS.map((plan) => referralReward(plan.id).referrerDays)));
  });
});

describe('MAX_FRIEND_DAYS', () => {
  it('is the largest bonus a friend can get on any plan', () => {
    expect(MAX_FRIEND_DAYS).toBe(Math.max(...PLANS.map((plan) => referralReward(plan.id).friendDays)));
  });
});
