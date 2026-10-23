import { ADMIN_PERIOD_DAYS, ADMIN_PERIODS } from '@gnomevpn/schemas';
import { differenceInCalendarDays } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { periodStart } from '../period-start';

const NOW = new Date('2026-10-23T12:00:00.000Z');

describe('periodStart', () => {
  it('reaches back exactly the period length', () => {
    for (const period of ADMIN_PERIODS) {
      const start = periodStart({ period, now: NOW });
      const days = ADMIN_PERIOD_DAYS[period];

      expect(start === null ? null : differenceInCalendarDays(NOW, start)).toBe(days);
    }
  });

  it('has no lower bound for all time', () => {
    expect(periodStart({ period: 'all', now: NOW })).toBeNull();
  });

  it('starts later for a shorter period', () => {
    const week = periodStart({ period: '7d', now: NOW });
    const month = periodStart({ period: '30d', now: NOW });

    expect(week && month && week > month).toBe(true);
  });
});
