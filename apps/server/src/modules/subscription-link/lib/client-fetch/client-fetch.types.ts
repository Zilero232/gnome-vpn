import type { DeviceHeaders } from '@/modules/devices';

export type ClientFetchInput = {
  headers: DeviceHeaders;
  hwid: string | null;
};
