import { PERIOD_GRACE } from '@/common/lib';

export const WINDOW = {
  renewHours: 24,
  configGraceHours: PERIOD_GRACE.hours,
  remindHours: 72,
  trialRemindHours: 3
} as const;
