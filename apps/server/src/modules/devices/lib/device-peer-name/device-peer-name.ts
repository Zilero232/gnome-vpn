import { DEVICE_PEER } from '@/modules/devices/config';

export const devicePeerName = (deviceId: string): string => `${DEVICE_PEER.namePrefix}${deviceId.replaceAll('-', '').slice(0, DEVICE_PEER.idLength)}`;
