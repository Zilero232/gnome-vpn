import type { SshClient } from '@gnomevpn/scripts/ssh';

import type { NodeConfig } from '../../node';

export type NodeSshInput = {
  ssh: SshClient;
  config: NodeConfig;
};

export type CanLogInWithKeyInput = {
  config: NodeConfig;
  privateKeyPath: string;
};
