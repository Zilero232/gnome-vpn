import { UPTIME_HISTORY } from '@gnomevpn/schemas';
import { groupBy, range } from 'remeda';

import type { UptimeHistory, UptimeHistoryInput } from './uptime-history.types';

import { addUtcDays, dayKey } from '../utc-day';
import { minuteRatio } from './uptime-history.helpers';

export const historyStart = (today: Date): Date => addUtcDays({ day: today, days: 1 - UPTIME_HISTORY.days });

export const uptimeHistory = ({ rows, today }: UptimeHistoryInput): UptimeHistory => {
  const start = historyStart(today);
  const byDay = groupBy(rows, (row) => dayKey(row.day));
  const dates = range(0, UPTIME_HISTORY.days).map((offset) => dayKey(addUtcDays({ day: start, days: offset })));

  return {
    days: dates.map((date) => ({ date, uptime: minuteRatio(byDay[date] ?? []) })),
    uptime: minuteRatio(dates.flatMap((date) => byDay[date] ?? []))
  };
};
