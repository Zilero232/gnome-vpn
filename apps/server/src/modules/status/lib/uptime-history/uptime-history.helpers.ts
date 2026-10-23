import { clamp, sumBy } from 'remeda';

import type { UptimeRow } from './uptime-history.types';

export const minuteRatio = (rows: UptimeRow[]): number | null => {
  const checked = sumBy(rows, (row) => row.checkedMinutes);

  return checked > 0 ? clamp(sumBy(rows, (row) => row.upMinutes) / checked, { min: 0, max: 1 }) : null;
};
