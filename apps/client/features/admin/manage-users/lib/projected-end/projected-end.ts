import { addDays, max } from 'date-fns';

import type { ProjectedEndInput } from './projected-end.types';

export const projectedEnd = ({ currentPeriodEnd, days, now }: ProjectedEndInput): Date =>
  addDays(max([now, currentPeriodEnd ? new Date(currentPeriodEnd) : now]), days);
