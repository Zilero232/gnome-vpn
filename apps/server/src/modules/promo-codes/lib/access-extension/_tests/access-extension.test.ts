import { addDays, addHours, subDays, subHours } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { PERIOD_GRACE } from '@/common/lib';

import { accessExtension } from '../access-extension';

const NOW = new Date('2026-10-23T12:00:00.000Z');
const DAYS = 30;

describe('accessExtension', () => {
  it('adds the days on top of a running period, so nothing already paid is lost', () => {
    const end = addDays(NOW, 10);

    expect(accessExtension({ currentPeriodEnd: end, days: DAYS, now: NOW }).currentPeriodEnd).toEqual(addDays(end, DAYS));
  });

  it('starts from now when the period has lapsed or never existed', () => {
    expect(accessExtension({ currentPeriodEnd: subDays(NOW, 40), days: DAYS, now: NOW }).currentPeriodEnd).toEqual(addDays(NOW, DAYS));
    expect(accessExtension({ currentPeriodEnd: null, days: DAYS, now: NOW }).currentPeriodEnd).toEqual(addDays(NOW, DAYS));
  });

  it('always ends in the future, whatever the period was', () => {
    for (const end of [null, subDays(NOW, 400), subHours(NOW, 1), addHours(NOW, 1), addDays(NOW, 400)]) {
      expect(accessExtension({ currentPeriodEnd: end, days: 1, now: NOW }).currentPeriodEnd.getTime()).toBeGreaterThan(NOW.getTime());
    }
  });

  it('keeps paid extras on a running period and within the grace, the way a renewal does', () => {
    expect(accessExtension({ currentPeriodEnd: addDays(NOW, 3), days: DAYS, now: NOW }).resetsExtras).toBe(false);
    expect(accessExtension({ currentPeriodEnd: subHours(NOW, PERIOD_GRACE.hours - 1), days: DAYS, now: NOW }).resetsExtras).toBe(false);
  });

  it('drops extras of a period that lapsed beyond the grace, so a free code never revives them', () => {
    expect(accessExtension({ currentPeriodEnd: subHours(NOW, PERIOD_GRACE.hours + 1), days: DAYS, now: NOW }).resetsExtras).toBe(true);
    expect(accessExtension({ currentPeriodEnd: null, days: DAYS, now: NOW }).resetsExtras).toBe(true);
  });
});
