import type { SshClient } from '@gnomevpn/scripts/ssh';

import type { NodeConfig, RelayConfig } from '../../node';
import type { RelayForward } from '../relay-rules';

export type RelayStatus = 'failed' | 'provisioned';

export type RelayResult = {
  host: string;
  status: RelayStatus;
  ports: number[];
  error?: string;
};

export type ProvisionRelayInput = {
  relay: RelayConfig;
  nodes: NodeConfig[];
};

export type InstallForwardingInput = {
  ssh: SshClient;
  forwards: RelayForward[];
};
