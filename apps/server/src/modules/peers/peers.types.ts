import type { TunnelProtocol } from '@gnomevpn/schemas';

import type { PeerKind, Prisma } from '@/generated';
import type { NodeAccess, NodeTraffic, XrayClient } from '@/lib/xray';

import type { PEER_REF_SELECT } from './config';

export type PeerRef = Prisma.PeerGetPayload<{ select: typeof PEER_REF_SELECT }>;

export type IssuePeerInput = {
  node: NodeAccess;
  nodeId?: string;
  userId: string;
  kind: PeerKind;
  protocol: TunnelProtocol;
  limitIp: number;
  name?: string;
};

export type IssueAndPersistInput = IssuePeerInput & {
  persist: (created: CreatedPeer) => Promise<void>;
};

export type CreatedPeer = {
  nodeCredential: string;
  address: string | null;
  email: string;
  protocol: TunnelProtocol;
};

export type IssuedCredential = {
  nodeCredential: string;
  address?: string;
};

export type DeleteClientInput = {
  client: XrayClient;
  email: string;
};

export type DiscardPeerInput = {
  node: NodeAccess;
  email: string;
};

export type SetPeerEnabledInput = {
  where: Prisma.PeerWhereInput;
  enabled: boolean;
};

export type ForEachNodeInput<TPeer> = {
  peers: TPeer[];
  run: (input: { client: XrayClient; peers: TPeer[] }) => Promise<void>;
};

export type RecordNodeTrafficInput = {
  nodeId: string;
  traffic: Map<string, NodeTraffic>;
};

export type TrafficClient = {
  nodeId: string;
  email: string;
};
