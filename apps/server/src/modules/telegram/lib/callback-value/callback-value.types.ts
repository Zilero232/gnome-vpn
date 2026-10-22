import type { WireguardKind } from '../../telegram.types';

export type CountFromInput = {
  raw: string;
  max: number;
};

export type DeviceAnswer = {
  isConfirmed: boolean;
  deviceId: string;
};

export type WireguardChoice = {
  nodeId: string;
  kind: WireguardKind;
};
