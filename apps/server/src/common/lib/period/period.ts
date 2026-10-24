import { MAX_EXTRA_DEVICES, resolveLimits } from '@gnomevpn/schemas';
import { add, addHours, isAfter, max, sub } from 'date-fns';
import { clamp, isNonNullish } from 'remeda';

import type {
  AccessExtension,
  AccessExtensionInput,
  ExtendPeriodInput,
  ExtraDevicesGrant,
  ExtraDevicesGrantInput,
  LapseInput,
  RewindPeriodInput,
  SubscriptionPeriod
} from './period.types';

import { PERIOD_GRACE } from './period.constants';

export const isPeriodActive = (currentPeriodEnd: Date | null | undefined): boolean =>
  Boolean(currentPeriodEnd && isAfter(currentPeriodEnd, new Date()));

export const extendPeriod = ({ currentPeriodEnd, months = 0, days = 0, now = new Date() }: ExtendPeriodInput): Date => {
  const start = isNonNullish(currentPeriodEnd) && isAfter(currentPeriodEnd, now) ? currentPeriodEnd : now;

  return add(start, { months, days });
};

export const rewindPeriod = ({ currentPeriodEnd, months = 0, days = 0 }: RewindPeriodInput): Date | null => {
  if (!isPeriodActive(currentPeriodEnd) || !currentPeriodEnd) {
    return currentPeriodEnd;
  }

  return max([new Date(), sub(currentPeriodEnd, { months, days })]);
};

export const hasLapsedBeyondGrace = ({ currentPeriodEnd, at }: LapseInput): boolean =>
  !currentPeriodEnd || !isAfter(addHours(currentPeriodEnd, PERIOD_GRACE.hours), at);

export const accessExtension = ({ currentPeriodEnd, days, now }: AccessExtensionInput): AccessExtension => ({
  currentPeriodEnd: extendPeriod({ currentPeriodEnd, days, now }),
  resetsExtras: hasLapsedBeyondGrace({ currentPeriodEnd, at: now })
});

export const extraDevicesGrant = ({ current, quantity }: ExtraDevicesGrantInput): ExtraDevicesGrant => {
  const granted = clamp(current + quantity, { max: MAX_EXTRA_DEVICES });

  return { granted, dropped: current + quantity - granted };
};

export const resolveStatus = (currentPeriodEnd: Date | null | undefined): 'active' | 'expired' =>
  isPeriodActive(currentPeriodEnd) ? 'active' : 'expired';

export const activeDeviceLimit = (subscription: SubscriptionPeriod | null | undefined): number => {
  const paidFor = isPeriodActive(subscription?.currentPeriodEnd) ? subscription?.extraDevices : 0;

  return resolveLimits(paidFor).deviceLimit;
};
