import { describe, expect, it } from 'vitest';

import { PLANS } from '../../billing/plans';
import { isReferralCode, normaliseReferralCode, referralReward } from '../referrals';
import { MAX_FRIEND_DAYS, MAX_REFERRER_DAYS, REFERRAL_CODE } from '../referrals.constants';
import { claimReferralSchema } from '../referrals.schemas';

describe('normaliseReferralCode', () => {
  it('upper-cases and drops whitespace someone typed or pasted', () => {
    expect(normaliseReferralCode('  ab cd\tef 23 ')).toBe('ABCDEF23');
  });
});

describe('isReferralCode', () => {
  it('accepts a code of the right length from the alphabet', () => {
    expect(isReferralCode('ABCDEF23')).toBe(true);
    expect(isReferralCode('abcdef23')).toBe(true);
  });

  it('refuses the characters a person confuses on screen', () => {
    expect(isReferralCode('ABCDEF0O')).toBe(false);
    expect(isReferralCode('ABCDEF1I')).toBe(false);
  });

  it('refuses a code of the wrong length', () => {
    expect(isReferralCode('ABCDEF2')).toBe(false);
    expect(isReferralCode('ABCDEF234')).toBe(false);
  });

  it('refuses a Telegram start payload that was not stripped of its prefix', () => {
    expect(isReferralCode('ref_ABCDEF23')).toBe(false);
  });

  it('builds on an alphabet without the ambiguous characters', () => {
    expect(REFERRAL_CODE.alphabet).not.toMatch(/[01IOL]/u);
  });
});

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
