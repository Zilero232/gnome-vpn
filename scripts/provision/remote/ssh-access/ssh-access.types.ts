import type { SshClient } from '@gnomevpn/scripts/ssh';

import type { SshTarget } from '../../node';

export type NodeSshInput = {
  ssh: SshClient;
  config: SshTarget;
};

export type CanLogInWithKeyInput = {
  config: SshTarget;
  privateKeyPath: string;
};
