import { ADMIN_REDEMPTION_KINDS } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { redemptionState } from '../redemption-state';

const AT = '2026-10-20T10:00:00.000Z';

describe('redemptionState', () => {
  it('reads days and gift codes as applied the moment they are redeemed', () => {
    for (const kind of ADMIN_REDEMPTION_KINDS.filter((each) => each !== 'discount')) {
      expect(redemptionState({ kind, consumedAt: null, replacedAt: null })).toBe('applied');
    }
  });

  it('follows a discount through its lifecycle', () => {
    expect(redemptionState({ kind: 'discount', consumedAt: null, replacedAt: null })).toBe('pending');
    expect(redemptionState({ kind: 'discount', consumedAt: null, replacedAt: AT })).toBe('replaced');
    expect(redemptionState({ kind: 'discount', consumedAt: AT, replacedAt: null })).toBe('consumed');
  });

  it('lets a paid discount win over a replacement stamp', () => {
    expect(redemptionState({ kind: 'discount', consumedAt: AT, replacedAt: AT })).toBe('consumed');
  });
});
