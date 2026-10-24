import { DEVICE_KEY, DEVICE_PEER } from '@/modules/devices/config';

export const deviceIpLimit = (key: string | null | undefined): number =>
  key?.startsWith(DEVICE_KEY.app) ? DEVICE_PEER.ipsPerKeylessClient : DEVICE_PEER.ipsPerClient;
