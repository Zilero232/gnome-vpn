import type { TunnelProtocol } from '@gnomevpn/schemas';

export type TunnelNode = {
  host: string;
  port: number;
  serverName: string;
  certFingerprint: string | null;
  realityPublicKey: string | null;
  realityShortId: string | null;
  wgPublicKey: string | null;
};

export type BuildConfigInput = {
  node: TunnelNode;
  protocol: TunnelProtocol;
  auth: string;
  address?: string | null;
};

export type RealityNode = {
  realityPublicKey: string | null;
  realityShortId: string | null;
};

export type WireguardNode = {
  wgPublicKey: string | null;
};

export type ResolvedWireguardNode<T extends WireguardNode> = T & {
  wgPublicKey: string;
};

export type ResolvedRealityNode<T extends RealityNode> = T & {
  realityPublicKey: string;
  realityShortId: string;
};
