import { isReferralCode } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { generateReferralCode } from '../referral-code';

describe('generateReferralCode', () => {
  it('mints codes the shared schema accepts', () => {
    for (let index = 0; index < 200; index += 1) {
      expect(isReferralCode(generateReferralCode())).toBe(true);
    }
  });

  it('does not repeat itself across a batch', () => {
    const codes = new Set(Array.from({ length: 200 }, generateReferralCode));

    expect(codes.size).toBe(200);
  });
});
