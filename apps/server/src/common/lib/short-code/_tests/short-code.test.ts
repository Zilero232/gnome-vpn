import { GIFT_CODE, isShortCode, promoCodeOrigin, SHORT_CODE } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { generateShortCode } from '../short-code';

describe('generateShortCode', () => {
  it('returns a code of the agreed length', () => {
    expect(generateShortCode()).toHaveLength(SHORT_CODE.length);
  });

  it('mints codes the shared shape accepts, so a link code and an invite code read back the same way', () => {
    for (let index = 0; index < 200; index += 1) {
      expect(isShortCode(generateShortCode())).toBe(true);
    }
  });

  it('does not repeat itself across a batch', () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateShortCode()));

    expect(codes.size).toBe(200);
  });

  it('mints a longer code from the same alphabet when asked, the way a gift code is made', () => {
    const code = generateShortCode(GIFT_CODE.length);

    expect(code).toHaveLength(GIFT_CODE.length);
    expect([...code].every((glyph) => SHORT_CODE.alphabet.includes(glyph))).toBe(true);
    expect(promoCodeOrigin(code)).toBe('gift');
  });
});
