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
  ordinal: number;
};

export type WireguardNodeSource = {
  id: string;
  country: string;
  countryCode: string;
};

export type WireguardNodeViewInput = {
  node: WireguardNodeSource;
  live: Set<string>;
};
