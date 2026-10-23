import { ADMIN_PERIOD_DAYS } from '@gnomevpn/schemas';
import { subDays } from 'date-fns';
import { isNullish } from 'remeda';

import type { PeriodStartInput } from './period-start.types';

export const periodStart = ({ period, now }: PeriodStartInput): Date | null => {
  const days = ADMIN_PERIOD_DAYS[period];

  return isNullish(days) ? null : subDays(now, days);
};
