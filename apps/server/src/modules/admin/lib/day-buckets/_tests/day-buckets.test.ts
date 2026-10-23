import { describe, expect, it } from 'vitest';

import { alignSeries, bucketStart, buildDays, dayKey, dayKeys } from '../day-buckets';

const NOW = new Date('2026-10-23T21:30:00.000Z');
const DAYS = 30;

describe('bucketStart', () => {
  it('starts at UTC midnight, so the last bucket is today', () => {
    const start = bucketStart({ now: NOW, days: DAYS });
    const keys = dayKeys({ start, days: DAYS });

    expect(start.toISOString().endsWith('T00:00:00.000Z')).toBe(true);
    expect(keys.at(-1)).toBe(dayKey(NOW));
  });

  it('reads the day in UTC, not in local time', () => {
    const lateEvening = new Date('2026-10-23T23:59:59.000Z');

    expect(dayKey(bucketStart({ now: lateEvening, days: 1 }))).toBe('2026-10-23');
  });
});

describe('dayKeys', () => {
  it('lists one key per day, oldest first, with no gaps', () => {
    const keys = dayKeys({ start: bucketStart({ now: NOW, days: DAYS }), days: DAYS });

    expect(keys).toHaveLength(DAYS);
    expect([...keys].sort()).toEqual(keys);
    expect(new Set(keys).size).toBe(DAYS);
  });
});

describe('alignSeries', () => {
  it('puts each row on its day and zero on a day the query skipped', () => {
    const keys = ['2026-10-21', '2026-10-22', '2026-10-23'];

    expect(alignSeries({ keys, rows: [{ day: '2026-10-23', value: 5 }] })).toEqual([0, 0, 5]);
  });

  it('drops a row outside the range', () => {
    const keys = ['2026-10-22', '2026-10-23'];
    const values = alignSeries({ keys, rows: [{ day: '2026-09-01', value: 7 }] });

    expect(values.every((value) => value === 0)).toBe(true);
  });
});

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
});
