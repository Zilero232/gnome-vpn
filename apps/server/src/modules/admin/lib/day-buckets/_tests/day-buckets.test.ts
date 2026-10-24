import { describe, expect, it } from 'vitest';

import { buildDays } from '../day-buckets';

const NO_ROWS = { revenue: [], payments: [], signups: [], newPaid: [], trials: [] };

describe('buildDays', () => {
  it('zips every series onto the same day', () => {
    const keys = ['2026-10-22', '2026-10-23'];
    const day = '2026-10-23';

    const [, last] = buildDays({
      keys,
      series: {
        revenue: [{ day, value: 990 }],
        payments: [{ day, value: 1 }],
        signups: [{ day, value: 4 }],
        newPaid: [{ day, value: 1 }],
        trials: [{ day, value: 2 }]
      }
    });

    expect(last).toEqual({ date: day, revenue: 990, payments: 1, signups: 4, newPaid: 1, trials: 2 });
  });

  it('puts zero on a day the query skipped', () => {
    const keys = ['2026-10-21', '2026-10-22', '2026-10-23'];
    const days = buildDays({ keys, series: { ...NO_ROWS, signups: [{ day: '2026-10-23', value: 5 }] } });

    expect(days.map((entry) => entry.signups)).toEqual([0, 0, 5]);
  });

  it('drops a row outside the range', () => {
    const keys = ['2026-10-22', '2026-10-23'];
    const days = buildDays({ keys, series: { ...NO_ROWS, revenue: [{ day: '2026-09-01', value: 7 }] } });

    expect(days.every((entry) => entry.revenue === 0)).toBe(true);
  });
});
