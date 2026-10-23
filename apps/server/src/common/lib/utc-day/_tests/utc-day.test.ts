import { describe, expect, it } from 'vitest';

import { addUtcDays, dayKey, dayKeys, utcDay, windowStart } from '../utc-day';

const NOW = new Date('2026-10-23T21:30:00.000Z');
const DAYS = 30;

describe('utcDay', () => {
  it('cuts a moment to the start of its UTC day, whatever the server zone', () => {
    const late = new Date('2026-10-23T23:59:59.999Z');

    expect(utcDay(late).toISOString()).toBe('2026-10-23T00:00:00.000Z');
  });

  it('keeps a moment already at midnight where it is', () => {
    const midnight = new Date('2026-10-23T00:00:00.000Z');

    expect(utcDay(midnight).getTime()).toBe(midnight.getTime());
  });
});

describe('addUtcDays', () => {
  it('moves across a month and a year boundary without drifting off midnight', () => {
    const day = utcDay(new Date('2026-12-31T12:00:00Z'));

    expect(addUtcDays({ day, days: 1 }).toISOString()).toBe('2027-01-01T00:00:00.000Z');
    expect(addUtcDays({ day, days: -31 }).toISOString()).toBe('2026-11-30T00:00:00.000Z');
  });

  it('undoes itself', () => {
    const day = utcDay(new Date('2026-03-29T05:00:00Z'));

    expect(addUtcDays({ day: addUtcDays({ day, days: 90 }), days: -90 }).getTime()).toBe(day.getTime());
  });
});

describe('dayKey', () => {
  it('names a day the way a date column and the client read it', () => {
    expect(dayKey(new Date('2026-10-23T18:30:00Z'))).toBe('2026-10-23');
  });
});

describe('windowStart', () => {
  it('starts at UTC midnight, so the last day of the window is today', () => {
    const start = windowStart({ now: NOW, days: DAYS });
    const keys = dayKeys({ start, days: DAYS });

    expect(start.toISOString().endsWith('T00:00:00.000Z')).toBe(true);
    expect(keys.at(-1)).toBe(dayKey(NOW));
  });

  it('reads the day in UTC, not in local time', () => {
    const lateEvening = new Date('2026-10-23T23:59:59.000Z');

    expect(dayKey(windowStart({ now: lateEvening, days: 1 }))).toBe('2026-10-23');
  });
});

describe('dayKeys', () => {
  it('lists one key per day, oldest first, with no gaps', () => {
    const keys = dayKeys({ start: windowStart({ now: NOW, days: DAYS }), days: DAYS });

    expect(keys).toHaveLength(DAYS);
    expect([...keys].sort()).toEqual(keys);
    expect(new Set(keys).size).toBe(DAYS);
  });
});
