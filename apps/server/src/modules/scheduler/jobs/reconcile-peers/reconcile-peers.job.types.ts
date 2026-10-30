import type { PeerKind, PeerState, TunnelProtocol } from '@/generated';
import type { IdentifiedNode } from '@/lib/xray';

export type ReconcileNode = IdentifiedNode;

export type PeerIdentity = {
  userId: string;
  kind: PeerKind;
  name: string | null;
  nodeId: string;
  protocol: TunnelProtocol;
};

export type ReconcilePeer = PeerIdentity & {
  id: string;
  deviceId: string | null;
  revokedAt: Date | null;
  state: PeerState;
  nodeCredential: string;
  tunnelAddress: string | null;
  device: { key: string } | null;
};

export type NoteFailureInput = {
  nodeId: string;
  reason: unknown;
};

export type ReconcileNodeInput = {
  node: ReconcileNode;
  withOrphans: boolean;
};
