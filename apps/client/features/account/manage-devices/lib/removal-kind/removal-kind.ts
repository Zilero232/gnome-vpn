import type { Device } from '@gnomevpn/schemas';

import { WIREGUARD_DEVICE_APP } from '@gnomevpn/schemas';

import { hasIncyWithoutHwid } from '@/entities/vpn/device';

import type { RemovalKind } from './removal-kind.types';

import { REMOVAL_KIND } from '../../config';

export const removalKind = (device: Device): RemovalKind => {
  if (device.app === WIREGUARD_DEVICE_APP && !device.isIdentified) {
    return REMOVAL_KIND.wireguard;
  }

  return hasIncyWithoutHwid([device]) ? REMOVAL_KIND.incyWithoutHwid : REMOVAL_KIND.app;
};
