import { describe, expect, it } from 'vitest';

import { grantedDays } from '../referral-grant';

describe('grantedDays', () => {
  it('grants the full reward well under the cap', () => {
    expect(grantedDays({ planned: 7, earned: 0, cap: 90 })).toBe(7);
  });

  it('grants only what is left under the cap', () => {
    expect(grantedDays({ planned: 30, earned: 75, cap: 90 })).toBe(15);
  });

  it('grants nothing once the cap is reached', () => {
    expect(grantedDays({ planned: 7, earned: 90, cap: 90 })).toBe(0);
  });

  it('never grants a negative number of days past the cap', () => {
    expect(grantedDays({ planned: 7, earned: 120, cap: 90 })).toBe(0);
  });
});
