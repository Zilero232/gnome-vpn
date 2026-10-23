import { describe, expect, it } from 'vitest';

import { visibleTrend } from '../trend';

describe('visibleTrend', () => {
  it('keeps a trend that has something in it', () => {
    const values = [0, 2, 0, 1];

    expect(visibleTrend(values)).toBe(values);
  });

  it('drops a flat line of zeros, so a quiet tile shows no sparkline at all', () => {
    expect(visibleTrend([0, 0, 0])).toBeUndefined();
    expect(visibleTrend([])).toBeUndefined();
  });
});
