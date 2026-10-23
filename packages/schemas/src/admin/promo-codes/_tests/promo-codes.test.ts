import { describe, expect, it } from 'vitest';

import { GIFT_CODE, PROMO_DAYS, PROMO_DISCOUNT } from '../../../promo-codes/promo-codes.constants';
import { SHORT_CODE } from '../../../short-code';
import { adminCampaignFormSchema } from '../promo-codes.schemas';

const valid = { code: 'blogger-2026', kind: 'discount', value: PROMO_DISCOUNT.minPercent, maxUses: null, until: '' } as const;

const shaped = (length: number) => SHORT_CODE.alphabet.slice(0, length);

describe('adminCampaignFormSchema', () => {
  it('stores the code the way redemption looks it up', () => {
    expect(adminCampaignFormSchema.parse(valid).code).toBe('BLOGGER2026');
  });

  it('turns an empty last day into no expiry', () => {
    expect(adminCampaignFormSchema.parse(valid).until).toBeNull();
    expect(adminCampaignFormSchema.parse({ ...valid, until: '2026-12-31' }).until).toBe('2026-12-31');
  });

  it('refuses a code shaped like a friend or a gift code', () => {
    for (const code of [shaped(SHORT_CODE.length), shaped(GIFT_CODE.length)]) {
      expect(adminCampaignFormSchema.safeParse({ ...valid, code }).success).toBe(false);
    }
  });

  it('holds a discount and bonus days to their own ranges', () => {
    const at = (kind: 'days' | 'discount', value: number) => adminCampaignFormSchema.safeParse({ ...valid, kind, value }).success;

    expect(at('discount', PROMO_DISCOUNT.maxPercent)).toBe(true);
    expect(at('discount', PROMO_DISCOUNT.maxPercent + 1)).toBe(false);
    expect(at('days', PROMO_DAYS.max)).toBe(true);
    expect(at('days', PROMO_DAYS.max + 1)).toBe(false);
    expect(at('days', PROMO_DAYS.min - 1)).toBe(false);
  });

  it('refuses a fractional value and a limit below one', () => {
    expect(adminCampaignFormSchema.safeParse({ ...valid, value: 1.5 }).success).toBe(false);
    expect(adminCampaignFormSchema.safeParse({ ...valid, maxUses: 0 }).success).toBe(false);
  });
});
