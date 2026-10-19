import type { DeviceHeaders } from '../../../devices';

export type ClientFetchInput = {
  headers: DeviceHeaders;
  hwid: string | null;
};
