import { UPTIME_HISTORY } from '@gnomevpn/schemas';
import { groupBy } from 'remeda';

import type { UptimeHistory, UptimeHistoryInput } from './uptime-history.types';

import { dayKey, dayKeys, windowStart } from '../../../../common/lib';
import { minuteRatio } from './uptime-history.helpers';

export const historyStart = (today: Date): Date => windowStart({ now: today, days: UPTIME_HISTORY.days });

export const uptimeHistory = ({ rows, today }: UptimeHistoryInput): UptimeHistory => {
  const byDay = groupBy(rows, (row) => dayKey(row.day));
  const dates = dayKeys({ start: historyStart(today), days: UPTIME_HISTORY.days });

  return {
    days: dates.map((date) => ({ date, uptime: minuteRatio(byDay[date] ?? []) })),
    uptime: minuteRatio(dates.flatMap((date) => byDay[date] ?? []))
  };
};
