import { ADMIN_GIFT, formatGiftCode, GIFT_CODE } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { maskGiftCode } from '../gift-mask';

const CODE = 'ABCDEFGHJKMN';

describe('maskGiftCode', () => {
  it('shows only the tail of the code', () => {
    const masked = maskGiftCode(CODE);

    expect(masked.endsWith(CODE.slice(-ADMIN_GIFT.visibleTail))).toBe(true);
    expect(masked).not.toContain(CODE.slice(0, CODE.length - ADMIN_GIFT.visibleTail));
  });

  it('keeps the grouping the buyer sees', () => {
    expect(maskGiftCode(CODE)).toHaveLength(formatGiftCode(CODE).length);
    expect(maskGiftCode(CODE).split(GIFT_CODE.separator)).toHaveLength(formatGiftCode(CODE).split(GIFT_CODE.separator).length);
  });

  it('masks every character it hides', () => {
    const hidden = maskGiftCode(CODE)
      .replaceAll(GIFT_CODE.separator, '')
      .slice(0, CODE.length - ADMIN_GIFT.visibleTail);

    expect([...hidden].every((char) => char === ADMIN_GIFT.mask)).toBe(true);
  });
});
