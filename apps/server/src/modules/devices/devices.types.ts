import type { DeviceIdentity } from './lib/device-identity';

export type AdmitDeviceInput = {
  userId: string;
  identity: DeviceIdentity;
  deviceLimit: number;
  canRegister?: boolean;
};

export type AdmittedDevice = {
  deviceId: string | null;
  isAllowed: boolean;
  isNew: boolean;
  deviceCount: number;
};

export type SurplusRevocation = {
  userId: string;
  deviceLimit: number;
  isActive: boolean;
  titles: string[];
};

export type RemoveDeviceInput = {
  userId: string;
  deviceId: string;
};

export type RevokePeersInput = {
  deviceIds: string[];
  now: Date;
};
