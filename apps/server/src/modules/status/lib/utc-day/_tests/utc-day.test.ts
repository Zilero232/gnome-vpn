import { describe, expect, it } from 'vitest';

import { addUtcDays, dayKey, utcDay } from '../utc-day';

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
