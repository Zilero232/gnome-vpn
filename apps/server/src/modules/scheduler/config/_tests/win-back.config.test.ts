import { describe, expect, it } from 'vitest';

import { campaignProblem } from '../../../promo-codes';
import { WIN_BACK } from '../win-back.config';

describe('WIN_BACK', () => {
  it('names codes a campaign could carry, so they never read as a friend or a gift code', () => {
    for (const code of Object.values(WIN_BACK.codes)) {
      expect(campaignProblem({ input: { code, kind: 'discount', percent: WIN_BACK.percent }, now: new Date() }), code).toBeNull();
    }
  });

  it('sends the first touch before the second', () => {
    for (const days of Object.values(WIN_BACK.touchDays)) {
      expect(days.first).toBeLessThan(days.second);
    }
  });
});
