import { MAX_EXTRA_DEVICES } from '@gnomevpn/schemas';
import { addDays, addHours, addMonths, subDays, subHours } from 'date-fns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { accessExtension, extendPeriod, extraDevicesGrant, hasLapsedBeyondGrace, isPeriodActive, resolveStatus, rewindPeriod } from '../period';
import { PERIOD_GRACE } from '../period.constants';

const NOW = new Date('2026-01-15T12:00:00.000Z');

describe('isPeriodActive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reports active for a period ending in the future', () => {
    expect(isPeriodActive(new Date('2026-02-15T12:00:00.000Z'))).toBe(true);
  });

  it('reports inactive for a period that already ended', () => {
    expect(isPeriodActive(new Date('2026-01-14T12:00:00.000Z'))).toBe(false);
  });

  it('reports inactive for a period ending exactly now', () => {
    expect(isPeriodActive(NOW)).toBe(false);
  });

  it('reports inactive for null', () => {
    expect(isPeriodActive(null)).toBe(false);
  });

  it('reports inactive for undefined', () => {
    expect(isPeriodActive(undefined)).toBe(false);
  });
});

describe('extendPeriod by months', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('extends an active subscription from its existing period end', () => {
    const result = extendPeriod({ currentPeriodEnd: new Date('2026-02-15T12:00:00.000Z'), months: 1 });

    expect(result.toISOString()).toBe('2026-03-15T12:00:00.000Z');
  });

  it('restarts from now when the period already expired', () => {
    const result = extendPeriod({ currentPeriodEnd: new Date('2025-12-01T12:00:00.000Z'), months: 1 });

    expect(result.toISOString()).toBe('2026-02-15T12:00:00.000Z');
  });

  it('restarts from now when there is no period at all', () => {
    expect(extendPeriod({ currentPeriodEnd: null, months: 1 }).toISOString()).toBe('2026-02-15T12:00:00.000Z');
  });

  it('restarts from now for an undefined period', () => {
    expect(extendPeriod({ currentPeriodEnd: undefined, months: 3 }).toISOString()).toBe('2026-04-15T12:00:00.000Z');
  });

  it('adds several months at once', () => {
    expect(extendPeriod({ currentPeriodEnd: null, months: 12 }).toISOString()).toBe('2027-01-15T12:00:00.000Z');
  });

  it('clamps to the last day of a shorter target month', () => {
    const result = extendPeriod({ currentPeriodEnd: new Date('2026-01-31T12:00:00.000Z'), months: 1 });

    expect(result.toISOString()).toBe('2026-02-28T12:00:00.000Z');
  });
});

describe('resolveStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves to active while the period runs', () => {
    expect(resolveStatus(new Date('2026-02-15T12:00:00.000Z'))).toBe('active');
  });

  it('resolves to expired once the period passed', () => {
    expect(resolveStatus(new Date('2026-01-01T12:00:00.000Z'))).toBe('expired');
  });

  it('resolves to expired without a period', () => {
    expect(resolveStatus(null)).toBe('expired');
  });
});

describe('extendPeriod by days', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds the days to the end of a running period', () => {
    expect(extendPeriod({ currentPeriodEnd: new Date('2026-02-01T00:00:00.000Z'), days: 7 })).toEqual(new Date('2026-02-08T00:00:00.000Z'));
  });

  it('counts the days from now when the period already ended', () => {
    expect(extendPeriod({ currentPeriodEnd: new Date('2026-01-01T00:00:00.000Z'), days: 7 })).toEqual(new Date('2026-01-22T12:00:00.000Z'));
  });

  it('counts the days from now when there was never a period', () => {
    expect(extendPeriod({ currentPeriodEnd: null, days: 3 })).toEqual(new Date('2026-01-18T12:00:00.000Z'));
  });

  it('counts from the moment it is given rather than the clock', () => {
    const now = new Date('2026-01-10T00:00:00.000Z');

    expect(extendPeriod({ currentPeriodEnd: null, days: 3, now })).toEqual(addDays(now, 3));
    expect(extendPeriod({ currentPeriodEnd: new Date('2026-01-12T00:00:00.000Z'), days: 3, now })).toEqual(new Date('2026-01-15T00:00:00.000Z'));
  });
});

describe('extendPeriod by months and days', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds the months first and the days after, the way a renewal adds banked bonus days', () => {
    const end = new Date('2026-01-31T12:00:00.000Z');

    expect(extendPeriod({ currentPeriodEnd: end, months: 1, days: 3 })).toEqual(addDays(addMonths(end, 1), 3));
    expect(extendPeriod({ currentPeriodEnd: null, months: 6, days: 15 })).toEqual(addDays(addMonths(NOW, 6), 15));
  });

  it('leaves a running period as it is when there is nothing to add', () => {
    const end = new Date('2026-02-15T12:00:00.000Z');

    expect(extendPeriod({ currentPeriodEnd: end })).toEqual(end);
  });
});

describe('rewindPeriod', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('takes the months and days off a running period', () => {
    expect(rewindPeriod({ currentPeriodEnd: new Date('2026-06-15T12:00:00.000Z'), months: 1, days: 3 })).toEqual(
      new Date('2026-05-12T12:00:00.000Z')
    );
  });

  it('never moves the end before now', () => {
    expect(rewindPeriod({ currentPeriodEnd: new Date('2026-02-01T00:00:00.000Z'), months: 6 })).toEqual(NOW);
  });

  it('leaves a lapsed period alone', () => {
    const lapsed = new Date('2026-01-01T00:00:00.000Z');

    expect(rewindPeriod({ currentPeriodEnd: lapsed, days: 7 })).toBe(lapsed);
  });

  it('leaves a missing period alone', () => {
    expect(rewindPeriod({ currentPeriodEnd: null, months: 1 })).toBeNull();
  });
});

describe('hasLapsedBeyondGrace', () => {
  const END = new Date('2026-01-15T12:00:00.000Z');

  it('treats a missing period as lapsed', () => {
    expect(hasLapsedBeyondGrace({ currentPeriodEnd: null, at: NOW })).toBe(true);
  });

  it('keeps a period inside the grace after its end', () => {
    expect(hasLapsedBeyondGrace({ currentPeriodEnd: END, at: new Date(END.getTime() + (PERIOD_GRACE.hours - 1) * 3_600_000) })).toBe(false);
  });

  it('calls a period lapsed once the grace is over', () => {
    expect(hasLapsedBeyondGrace({ currentPeriodEnd: END, at: new Date(END.getTime() + PERIOD_GRACE.hours * 3_600_000) })).toBe(true);
  });

  it('keeps a running period', () => {
    expect(hasLapsedBeyondGrace({ currentPeriodEnd: END, at: new Date('2026-01-01T00:00:00.000Z') })).toBe(false);
  });
});

describe('accessExtension', () => {
  const ACCESS_NOW = new Date('2026-10-23T12:00:00.000Z');
  const DAYS = 30;

  it('adds the days on top of a running period, so nothing already paid is lost', () => {
    const end = addDays(ACCESS_NOW, 10);

    expect(accessExtension({ currentPeriodEnd: end, days: DAYS, now: ACCESS_NOW }).currentPeriodEnd).toEqual(addDays(end, DAYS));
  });

  it('starts from now when the period has lapsed or never existed', () => {
    expect(accessExtension({ currentPeriodEnd: subDays(ACCESS_NOW, 40), days: DAYS, now: ACCESS_NOW }).currentPeriodEnd).toEqual(
      addDays(ACCESS_NOW, DAYS)
    );

    expect(accessExtension({ currentPeriodEnd: null, days: DAYS, now: ACCESS_NOW }).currentPeriodEnd).toEqual(addDays(ACCESS_NOW, DAYS));
  });

  it('always ends in the future, whatever the period was', () => {
    for (const end of [null, subDays(ACCESS_NOW, 400), subHours(ACCESS_NOW, 1), addHours(ACCESS_NOW, 1), addDays(ACCESS_NOW, 400)]) {
      expect(accessExtension({ currentPeriodEnd: end, days: 1, now: ACCESS_NOW }).currentPeriodEnd.getTime()).toBeGreaterThan(ACCESS_NOW.getTime());
    }
  });

  it('keeps paid extras on a running period and within the grace, the way a renewal does', () => {
    expect(accessExtension({ currentPeriodEnd: addDays(ACCESS_NOW, 3), days: DAYS, now: ACCESS_NOW }).resetsExtras).toBe(false);
    expect(accessExtension({ currentPeriodEnd: subHours(ACCESS_NOW, PERIOD_GRACE.hours - 1), days: DAYS, now: ACCESS_NOW }).resetsExtras).toBe(false);
  });

  it('drops extras of a period that lapsed beyond the grace, so a free code never revives them', () => {
    expect(accessExtension({ currentPeriodEnd: subHours(ACCESS_NOW, PERIOD_GRACE.hours + 1), days: DAYS, now: ACCESS_NOW }).resetsExtras).toBe(true);
    expect(accessExtension({ currentPeriodEnd: null, days: DAYS, now: ACCESS_NOW }).resetsExtras).toBe(true);
  });
});

describe('extraDevicesGrant', () => {
  it('grants every paid place under the limit and drops none', () => {
    expect(extraDevicesGrant({ current: 1, quantity: 2 })).toEqual({ granted: 3, dropped: 0 });
  });

  it('grants up to the limit exactly', () => {
    expect(extraDevicesGrant({ current: MAX_EXTRA_DEVICES - 2, quantity: 2 })).toEqual({ granted: MAX_EXTRA_DEVICES, dropped: 0 });
  });

  it('caps at the limit and reports what it dropped, so the overflow is reviewed by hand', () => {
    expect(extraDevicesGrant({ current: MAX_EXTRA_DEVICES - 1, quantity: 3 })).toEqual({ granted: MAX_EXTRA_DEVICES, dropped: 2 });
  });
});
