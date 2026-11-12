import type { NodeConfig, RelayConfig } from '../../node';

export type RelayForward = {
  tunnelPort: number;
  target: string;
  wireguardPort?: number;
};

export type RelayForwardsInput = {
  relay: RelayConfig;
  nodes: NodeConfig[];
};
