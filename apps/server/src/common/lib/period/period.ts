import { resolveLimits } from '@gnomevpn/schemas';
import { addDays, addHours, addMonths, isAfter, max, sub } from 'date-fns';

import type { ExtendPeriodInput, LapseInput, PeriodInput, RewindPeriodInput, SubscriptionPeriod } from './period.types';

import { PERIOD_GRACE } from './period.constants';

export const isPeriodActive = (currentPeriodEnd: Date | null | undefined): boolean =>
  Boolean(currentPeriodEnd && isAfter(currentPeriodEnd, new Date()));

export const nextPeriodEnd = ({ currentPeriodEnd, months }: PeriodInput): Date => {
  const base = isPeriodActive(currentPeriodEnd) && currentPeriodEnd ? currentPeriodEnd : new Date();

  return addMonths(base, months);
};

export const extendPeriod = ({ currentPeriodEnd, days }: ExtendPeriodInput): Date => {
  const base = isPeriodActive(currentPeriodEnd) && currentPeriodEnd ? currentPeriodEnd : new Date();

  return addDays(base, days);
};

export const rewindPeriod = ({ currentPeriodEnd, months = 0, days = 0 }: RewindPeriodInput): Date | null => {
  if (!isPeriodActive(currentPeriodEnd) || !currentPeriodEnd) {
    return currentPeriodEnd;
  }

  return max([new Date(), sub(currentPeriodEnd, { months, days })]);
};

export const hasLapsedBeyondGrace = ({ currentPeriodEnd, at }: LapseInput): boolean =>
  !currentPeriodEnd || !isAfter(addHours(currentPeriodEnd, PERIOD_GRACE.hours), at);

export const resolveStatus = (currentPeriodEnd: Date | null | undefined): 'active' | 'expired' =>
  isPeriodActive(currentPeriodEnd) ? 'active' : 'expired';

export const activeDeviceLimit = (subscription: SubscriptionPeriod | null | undefined): number => {
  const paidFor = isPeriodActive(subscription?.currentPeriodEnd) ? subscription?.extraDevices : 0;

  return resolveLimits(paidFor).deviceLimit;
};
