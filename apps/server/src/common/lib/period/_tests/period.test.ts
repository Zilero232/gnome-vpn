import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { extendPeriod, hasLapsedBeyondGrace, isPeriodActive, nextPeriodEnd, resolveStatus, rewindPeriod } from '../period';
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

describe('nextPeriodEnd', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('extends an active subscription from its existing period end', () => {
    const result = nextPeriodEnd({ currentPeriodEnd: new Date('2026-02-15T12:00:00.000Z'), months: 1 });

    expect(result.toISOString()).toBe('2026-03-15T12:00:00.000Z');
  });

  it('restarts from now when the period already expired', () => {
    const result = nextPeriodEnd({ currentPeriodEnd: new Date('2025-12-01T12:00:00.000Z'), months: 1 });

    expect(result.toISOString()).toBe('2026-02-15T12:00:00.000Z');
  });

  it('restarts from now when there is no period at all', () => {
    expect(nextPeriodEnd({ currentPeriodEnd: null, months: 1 }).toISOString()).toBe('2026-02-15T12:00:00.000Z');
  });

  it('restarts from now for an undefined period', () => {
    expect(nextPeriodEnd({ currentPeriodEnd: undefined, months: 3 }).toISOString()).toBe('2026-04-15T12:00:00.000Z');
  });

  it('adds several months at once', () => {
    expect(nextPeriodEnd({ currentPeriodEnd: null, months: 12 }).toISOString()).toBe('2027-01-15T12:00:00.000Z');
  });

  it('clamps to the last day of a shorter target month', () => {
    const result = nextPeriodEnd({ currentPeriodEnd: new Date('2026-01-31T12:00:00.000Z'), months: 1 });

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

describe('extendPeriod', () => {
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
