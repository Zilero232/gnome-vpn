import type { NodeConfig, RelayConfig } from '../../node';

export type RelayForward = {
  port: number;
  target: string;
};

export type RelayForwardsInput = {
  relay: RelayConfig;
  nodes: NodeConfig[];
};
