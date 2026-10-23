import { firstBy, sumBy } from 'remeda';

import type { DailyPoint, DailyPointsInput, DailySummary, DailySummaryInput } from './daily-series.types';

export const dailyPoints = ({ days, metric, formatDay }: DailyPointsInput): DailyPoint[] =>
  days.map((day) => ({ key: day.date, label: formatDay(day.date), value: day[metric] }));

export const dailySummary = ({ days, metric }: DailySummaryInput): DailySummary => {
  const peak = firstBy(
    days.filter((day) => day[metric] > 0),
    [(day) => day[metric], 'desc']
  );

  return {
    total: sumBy(days, (day) => day[metric]),
    peak: peak ? { date: peak.date, value: peak[metric] } : null
  };
};
