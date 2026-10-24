import type { TunnelProtocol } from '@gnomevpn/schemas';

import type { PeerKind, PeerState } from '@/generated';

export type PeerNameInput = {
  userId: string;
  kind: PeerKind;
  name?: string | null;
  nodeId?: string;
  protocol?: TunnelProtocol | null;
};

export type PeerRevocation = {
  revokedAt: Date;
  state: PeerState;
};
