import { isNullish } from 'remeda';

import { peerClientName } from '@/modules/peers';

import type { DeviceActivityInput } from './device-activity.types';

export const deviceActivity = ({ peers, lastOnline }: DeviceActivityInput): Map<string, Date> => {
  const activity = new Map<string, Date>();

  for (const peer of peers) {
    const at = lastOnline.get(peerClientName(peer));
    const known = peer.deviceId ? activity.get(peer.deviceId) : undefined;

    if (isNullish(peer.deviceId) || isNullish(at) || (known && known >= at)) {
      continue;
    }

    activity.set(peer.deviceId, at);
  }

  return activity;
};
