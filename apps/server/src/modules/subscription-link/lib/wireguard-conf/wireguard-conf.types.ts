export type WireguardConfInput = {
  privateKey: string;
  address: string;
  dns: readonly string[];
  mtu: number;
  serverPublicKey: string;
  host: string;
  port: number;
  keepAlive: number;
};

export type WireguardFileNameInput = {
  countryCode: string;
  deviceId: string;
};

export type WireguardNodeSource = {
  id: string;
  country: string;
  countryCode: string;
  city: string | null;
};
