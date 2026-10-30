import { isNonNullish, isNullish, unique } from 'remeda';

import { DEVICE_HEADER, DEVICE_KEY, DEVICE_PEER, DEVICE_TITLE } from '@/modules/devices/config';

import type { DeviceHeaders, DeviceIdentity, TitledDevice } from './device-identity.types';

import { agentPlatformOf, appOf, cleaned, headerOf, hwidOf } from './device-identity.helpers';

export const deviceIdentity = (headers: DeviceHeaders): DeviceIdentity => {
  const userAgent = headerOf({ headers, name: DEVICE_HEADER.userAgent });
  const hwid = hwidOf(headers);
  const app = appOf(userAgent);

  return {
    key: hwid ? `${DEVICE_KEY.hwid}${hwid}` : `${DEVICE_KEY.app}${(app ?? DEVICE_KEY.unknownApp).toLowerCase()}`,
    hwid,
    platform: cleaned({ value: headerOf({ headers, name: DEVICE_HEADER.platform }) }) ?? agentPlatformOf(userAgent),
    model: cleaned({ value: headerOf({ headers, name: DEVICE_HEADER.model }) }),
    osVersion: cleaned({ value: headerOf({ headers, name: DEVICE_HEADER.osVersion }) }),
    app
  };
};

export const isKeylessIncy = (identity: DeviceIdentity): boolean => isNullish(identity.hwid) && identity.app === DEVICE_KEY.incyApp;

export const isWireguardDevice = (key: string): boolean => key.startsWith(DEVICE_KEY.wireguard);

export const devicePeerName = (deviceId: string): string => `${DEVICE_PEER.namePrefix}${deviceId.replaceAll('-', '').slice(0, DEVICE_PEER.idLength)}`;

export const deviceTitle = ({ model, app, platform }: TitledDevice): string => {
  const parts = unique([model ?? platform, app].filter(isNonNullish));

  return parts.length > 0 ? parts.join(DEVICE_TITLE.separator) : DEVICE_TITLE.unknown;
};
