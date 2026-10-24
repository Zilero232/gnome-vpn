import { PERIOD_GRACE } from '@/common/lib';
import { AUTO_RENEW } from '@/modules/billing';

export const WINDOW = {
  renewHours: AUTO_RENEW.windowHours,
  configGraceHours: PERIOD_GRACE.hours,
  remindHours: 72,
  trialRemindHours: 3
} as const;
