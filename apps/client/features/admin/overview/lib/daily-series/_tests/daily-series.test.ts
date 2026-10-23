import type { AdminDay } from '@gnomevpn/schemas';

import { describe, expect, it } from 'vitest';

import { dailyPoints, dailySummary } from '../daily-series';

const day = (date: string, patch: Partial<AdminDay> = {}): AdminDay => ({
  date,
  revenue: 0,
  payments: 0,
  signups: 0,
  newPaid: 0,
  trials: 0,
  ...patch
});

const DAYS = [
  day('2026-10-01', { revenue: 200, payments: 1 }),
  day('2026-10-02'),
  day('2026-10-03', { revenue: 1690, payments: 2, signups: 4 }),
  day('2026-10-04', { revenue: 990, payments: 1 })
];

describe('dailyPoints', () => {
  it('keeps one point per day, in order, keyed by the date', () => {
    const points = dailyPoints({ days: DAYS, metric: 'revenue', formatDay: (date) => `label ${date}` });

    expect(points.map((point) => point.key)).toEqual(DAYS.map((each) => each.date));
    expect(points.map((point) => point.value)).toEqual(DAYS.map((each) => each.revenue));
    expect(points[0].label).toBe(`label ${DAYS[0].date}`);
  });
});

describe('dailySummary', () => {
  it('sums the measure over the whole range', () => {
    const { total } = dailySummary({ days: DAYS, metric: 'payments' });

    expect(total).toBe(DAYS.reduce((sum, each) => sum + each.payments, 0));
  });

  it('names the day the measure peaked, and no day ever exceeds it', () => {
    const { peak } = dailySummary({ days: DAYS, metric: 'revenue' });

    expect(peak).not.toBeNull();
    expect(DAYS.every((each) => each.revenue <= (peak?.value ?? 0))).toBe(true);
    expect(DAYS.find((each) => each.date === peak?.date)?.revenue).toBe(peak?.value);
  });

  it('has no peak when nothing happened', () => {
    expect(dailySummary({ days: DAYS, metric: 'trials' })).toEqual({ total: 0, peak: null });
  });
});
