import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const SSH_KEY = {
  names: ['gnomevpn_deploy', 'id_ed25519', 'id_rsa', 'id_ecdsa'],
  nodeEnv: 'PROVISION_NODE_SSH_KEY'
} as const;

export const defaultKeyPath = (): string | undefined => {
  const candidates = SSH_KEY.names.map((name) => join(homedir(), '.ssh', name));

  return candidates.find((path) => existsSync(path));
};
