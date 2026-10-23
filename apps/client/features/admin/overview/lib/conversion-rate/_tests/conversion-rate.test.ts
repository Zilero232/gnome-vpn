import { describe, expect, it } from 'vitest';

import { conversionRate } from '../conversion-rate';

describe('conversionRate', () => {
  it('is the share of trials that went on to pay', () => {
    expect(conversionRate({ trials: 8, converted: 2 })).toBe(2 / 8);
  });

  it('has no rate before anyone took a trial, rather than a fake zero', () => {
    expect(conversionRate({ trials: 0, converted: 0 })).toBeNull();
  });

  it('never reads above one', () => {
    expect(conversionRate({ trials: 1, converted: 3 })).toBe(1);
  });
});
