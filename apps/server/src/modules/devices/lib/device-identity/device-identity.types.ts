export type DeviceHeaders = Record<string, string | string[] | undefined>;

export type DeviceIdentity = {
  key: string;
  hwid: string | null;
  platform: string | null;
  model: string | null;
  osVersion: string | null;
  app: string | null;
};

export type HeaderOfInput = {
  headers: DeviceHeaders;
  name: string;
};

export type CleanedInput = {
  value: string | null;
  maxLength?: number;
};

export type TitledDevice = {
  model: string | null;
  app: string | null;
  platform: string | null;
};

export type IncyAgent = {
  version: string;
  platform: string;
};
