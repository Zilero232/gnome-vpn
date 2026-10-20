import { isShortCode, SHORT_CODE } from '@gnomevpn/schemas';
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
    const codes = new Set(Array.from({ length: 200 }, generateShortCode));

    expect(codes.size).toBe(200);
  });
});
