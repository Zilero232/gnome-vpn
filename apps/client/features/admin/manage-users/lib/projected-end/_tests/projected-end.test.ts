import { addDays, differenceInCalendarDays, subDays } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { projectedEnd } from '../projected-end';

const NOW = new Date('2026-10-23T12:00:00.000Z');
const DAYS = 30;

describe('projectedEnd', () => {
  it('adds the days on top of a period that is still running', () => {
    const end = addDays(NOW, 5);

    expect(differenceInCalendarDays(projectedEnd({ currentPeriodEnd: end.toISOString(), days: DAYS, now: NOW }), end)).toBe(DAYS);
  });

  it('starts from now for a period that has already ended, so lapsed time is not paid back', () => {
    const lapsed = subDays(NOW, 40).toISOString();

    expect(projectedEnd({ currentPeriodEnd: lapsed, days: DAYS, now: NOW })).toEqual(addDays(NOW, DAYS));
  });

  it('starts from now for an account that never had a period', () => {
    expect(projectedEnd({ currentPeriodEnd: null, days: DAYS, now: NOW })).toEqual(addDays(NOW, DAYS));
  });
});
