import { GIFT_CODE, PROMO_CODE, PROMO_DAYS, PROMO_DISCOUNT, SHORT_CODE } from '@gnomevpn/schemas';
import { addDays, subMinutes } from 'date-fns';
import { describe, expect, it } from 'vitest';

import type { CreateCampaignInput } from '../campaign.types';

import { campaignDraft, campaignProblem } from '../campaign';

const NOW = new Date('2026-10-23T12:00:00.000Z');

const discount = (overrides: Partial<Extract<CreateCampaignInput, { kind: 'discount' }>> = {}): CreateCampaignInput => ({
  code: 'BLOGGER20',
  kind: 'discount',
  percent: 20,
  ...overrides
});

const days = (value: number): CreateCampaignInput => ({ code: 'WELCOME30', kind: 'days', days: value });

const problemOf = (input: CreateCampaignInput) => campaignProblem({ input, now: NOW });

describe('campaignProblem', () => {
  it('accepts a well-formed discount and a well-formed bonus', () => {
    expect(problemOf(discount())).toBeNull();
    expect(problemOf(days(PROMO_DAYS.max))).toBeNull();
  });

  it('refuses a code outside the promo format', () => {
    expect(problemOf(discount({ code: 'A'.repeat(PROMO_CODE.minLength - 1) }))).toBe('codeFormat');
    expect(problemOf(discount({ code: 'A'.repeat(PROMO_CODE.maxLength + 1) }))).toBe('codeFormat');
    expect(problemOf(discount({ code: 'СКИДКА20' }))).toBe('codeFormat');
  });

  it('refuses a code a friend code or a gift code could ever be, so the three never collide', () => {
    expect(problemOf(discount({ code: SHORT_CODE.alphabet.slice(0, SHORT_CODE.length) }))).toBe('codeLikeFriend');
    expect(problemOf(discount({ code: SHORT_CODE.alphabet.slice(0, GIFT_CODE.length) }))).toBe('codeLikeGift');
  });

  it('keeps a discount inside its percent bounds, in whole percents', () => {
    expect(problemOf(discount({ percent: PROMO_DISCOUNT.minPercent }))).toBeNull();
    expect(problemOf(discount({ percent: PROMO_DISCOUNT.maxPercent }))).toBeNull();
    expect(problemOf(discount({ percent: PROMO_DISCOUNT.minPercent - 1 }))).toBe('percentRange');
    expect(problemOf(discount({ percent: PROMO_DISCOUNT.maxPercent + 1 }))).toBe('percentRange');
    expect(problemOf(discount({ percent: 12.5 }))).toBe('percentRange');
  });

  it('keeps bonus days inside their bounds, in whole days', () => {
    expect(problemOf(days(PROMO_DAYS.min))).toBeNull();
    expect(problemOf(days(PROMO_DAYS.min - 1))).toBe('daysRange');
    expect(problemOf(days(PROMO_DAYS.max + 1))).toBe('daysRange');
    expect(problemOf(days(1.5))).toBe('daysRange');
  });

  it('takes no limit on uses, or a positive whole one the database column can hold', () => {
    expect(problemOf(discount({ maxUses: null }))).toBeNull();
    expect(problemOf(discount({ maxUses: 1 }))).toBeNull();
    expect(problemOf(discount({ maxUses: PROMO_CODE.maxUses }))).toBeNull();
    expect(problemOf(discount({ maxUses: 0 }))).toBe('maxUsesRange');
    expect(problemOf(discount({ maxUses: 2.5 }))).toBe('maxUsesRange');
    expect(problemOf(discount({ maxUses: PROMO_CODE.maxUses + 1 }))).toBe('maxUsesRange');
    expect(PROMO_CODE.maxUses).toBeLessThanOrEqual(2 ** 31 - 1);
  });

  it('takes no expiry, or one in the future', () => {
    expect(problemOf(discount({ expiresAt: addDays(NOW, 1) }))).toBeNull();
    expect(problemOf(discount({ expiresAt: subMinutes(NOW, 1) }))).toBe('expiryPast');
    expect(problemOf(discount({ expiresAt: NOW }))).toBe('expiryPast');
    expect(problemOf(discount({ expiresAt: new Date('not a date') }))).toBe('expiryInvalid');
  });
});

describe('campaignDraft', () => {
  it('stores the normalised code and only the effect of its kind', () => {
    expect(campaignDraft(discount({ code: ' blogger-20 ' }))).toEqual({
      code: 'BLOGGER20',
      kind: 'discount',
      percent: 20,
      days: null,
      maxUses: null,
      expiresAt: null
    });

    expect(campaignDraft(days(30))).toMatchObject({ kind: 'days', days: 30, percent: null });
  });
});
