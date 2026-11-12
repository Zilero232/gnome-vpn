import type { NodeConfig, PrismaLike, RelayConfig } from '../../node';

export type NodeRelay = {
  relayHost: string | null;
  relayPort: number | null;
  relayWireguardPort: number | null;
};

export type RelayAssignment = NodeRelay & {
  host: string;
};

export type RelayAssignmentsInput = {
  nodes: NodeConfig[];
  relays: RelayConfig[];
  failedRelays: string[];
};

export type AssignRelaysInput = RelayAssignmentsInput & {
  prisma: PrismaLike;
};
