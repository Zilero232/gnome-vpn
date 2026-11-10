import { describe, expect, it } from 'vitest';

import { lossPercent } from '../node-reach.helpers';

describe('lossPercent', () => {
  it('gives the share of attempts that failed, in whole percent', () => {
    expect(lossPercent({ attempts: 20, failures: 3 })).toBe(15);
    expect(lossPercent({ attempts: 3, failures: 1 })).toBe(33);
  });

  it('reads no attempts as no loss rather than dividing by zero', () => {
    expect(lossPercent({ attempts: 0, failures: 0 })).toBe(0);
  });

  it('stays within 0 and 100', () => {
    expect(lossPercent({ attempts: 20, failures: 0 })).toBe(0);
    expect(lossPercent({ attempts: 20, failures: 20 })).toBe(100);
  });
});
