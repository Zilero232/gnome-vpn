import { resolveLimits } from '@gnomevpn/schemas';
import { sortBy } from 'remeda';

import type { GraceDeviceLimitInput, SlotHoldersInput } from './device-slots.types';

import { activeDeviceLimit, hasLapsedBeyondGrace } from '../../../../common/lib';

export const slotHolders = ({ devices, limit }: SlotHoldersInput): Set<string> => {
  const ordered = sortBy(devices, [(device) => device.createdAt.getTime(), 'asc'], [(device) => device.id, 'asc']);

  return new Set(ordered.slice(0, Math.max(limit, 0)).map((device) => device.id));
};

export const graceDeviceLimit = ({ subscription, now }: GraceDeviceLimitInput): number => {
  if (hasLapsedBeyondGrace({ currentPeriodEnd: subscription?.currentPeriodEnd, at: now })) {
    return activeDeviceLimit(subscription);
  }

  return resolveLimits(subscription?.extraDevices).deviceLimit;
};
