import { UPTIME_HISTORY } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import type { UptimeRow } from '../uptime-history.types';

import { addUtcDays, dayKey, utcDay } from '../../../../../common/lib';
import { historyStart, uptimeHistory } from '../uptime-history';

const TODAY = utcDay(new Date('2026-10-23T15:00:00Z'));

const row = ({ daysAgo, ...minutes }: Omit<UptimeRow, 'day'> & { daysAgo: number }): UptimeRow => ({
  day: addUtcDays({ day: TODAY, days: -daysAgo }),
  ...minutes
});

describe('uptimeHistory', () => {
  it('lists every day of the window once, oldest first and ending today', () => {
    const { days } = uptimeHistory({ rows: [], today: TODAY });

    expect(days).toHaveLength(UPTIME_HISTORY.days);
    expect(days.at(0)?.date).toBe(dayKey(historyStart(TODAY)));
    expect(days.at(-1)?.date).toBe(dayKey(TODAY));
    expect(new Set(days.map(({ date }) => date)).size).toBe(UPTIME_HISTORY.days);
  });

  it('leaves a day nothing checked empty rather than calling it an outage', () => {
    const { days, uptime } = uptimeHistory({ rows: [], today: TODAY });

    expect(days.every((day) => day.uptime === null)).toBe(true);
    expect(uptime).toBeNull();
  });

  it('gives a day the share of its checked minutes the node was up', () => {
    const { days } = uptimeHistory({ rows: [row({ daysAgo: 0, checkedMinutes: 200, upMinutes: 150 })], today: TODAY });

    expect(days.at(-1)?.uptime).toBe(150 / 200);
  });

  it('weights the window by minutes, so a short day does not count as a whole one', () => {
    const rows = [row({ daysAgo: 1, checkedMinutes: 1440, upMinutes: 1440 }), row({ daysAgo: 0, checkedMinutes: 60, upMinutes: 0 })];
    const { uptime } = uptimeHistory({ rows, today: TODAY });

    expect(uptime).toBe(1440 / (1440 + 60));
  });

  it('ignores rows older than the window', () => {
    const rows = [row({ daysAgo: UPTIME_HISTORY.days, checkedMinutes: 1440, upMinutes: 0 }), row({ daysAgo: 0, checkedMinutes: 10, upMinutes: 10 })];
    const { uptime } = uptimeHistory({ rows, today: TODAY });

    expect(uptime).toBe(1);
  });

  it('never reports more than all of the time, even from a row that counted wrong', () => {
    const { days, uptime } = uptimeHistory({ rows: [row({ daysAgo: 0, checkedMinutes: 10, upMinutes: 12 })], today: TODAY });

    expect(days.at(-1)?.uptime).toBe(1);
    expect(uptime).toBe(1);
  });
});

describe('historyStart', () => {
  it('opens the window so that it holds exactly the configured number of days', () => {
    const start = historyStart(TODAY);

    expect(addUtcDays({ day: start, days: UPTIME_HISTORY.days - 1 }).getTime()).toBe(TODAY.getTime());
  });
});
