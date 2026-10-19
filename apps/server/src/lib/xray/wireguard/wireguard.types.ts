export type WireguardClient = {
  email: string;
  privateKey?: string;
  publicKey?: string;
  allowedIPs?: string[];
  limitIp?: number;
  enable?: boolean;
};

export type CreateWireguardClientInput = {
  email: string;
  privateKey: string;
  publicKey: string;
  limitIp: number;
  address?: string | null;
};

export type CreateWireguardClientResult = {
  nodeCredential: string;
  address: string;
  email: string;
};

export type ReaddInput = {
  inboundId: number;
  client: WireguardClient;
};
