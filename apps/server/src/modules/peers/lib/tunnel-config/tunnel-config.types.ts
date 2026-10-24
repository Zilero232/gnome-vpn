import type { TunnelProtocol } from '@gnomevpn/schemas';

export type RealityNode = {
  realityPublicKey: string | null;
  realityShortId: string | null;
};

export type WireguardNode = {
  wgPublicKey: string | null;
};

export type ProtocolNode = RealityNode & WireguardNode;

export type TunnelNode = ProtocolNode & {
  host: string;
  port: number;
  serverName: string;
  certFingerprint: string | null;
};

export type ResolvedRealityNode<T extends RealityNode> = T & {
  realityPublicKey: string;
  realityShortId: string;
};

export type ResolvedWireguardNode<T extends WireguardNode> = T & {
  wgPublicKey: string;
};

export type BuildConfigInput = {
  node: TunnelNode;
  protocol: TunnelProtocol;
  auth: string;
  address?: string | null;
};
