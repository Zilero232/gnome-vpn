import type { SshClient } from '@gnomevpn/scripts/ssh';

import { dirOf } from '@gnomevpn/scripts/shell';

import type { EnsuredWireguardKeys } from './wireguard-keys.types';

import { generateWireguardKeys } from '../../../../apps/server/src/modules/peers/lib/wireguard-keys';
import { log, NODE_FILES } from '../../config';
import { seedKeyFilesScript } from '../key-files';
import { inContainer } from '../xray-stack';

export const ensureWireguardKeys = async (ssh: SshClient): Promise<EnsuredWireguardKeys> => {
  const fresh = generateWireguardKeys();

  const seed = [
    { path: NODE_FILES.wgKey, value: fresh.privateKey },
    { path: NODE_FILES.wgPub, value: fresh.publicKey }
  ];

  log.step('ensuring the wireguard server keys');

  const result = await ssh.exec(inContainer(seedKeyFilesScript({ dir: dirOf(NODE_FILES.wgKey), seed })));

  if (result.exitCode !== 0) {
    throw new Error(`cannot reach the panel container to read the WireGuard keys: ${result.stderr.trim() || 'no output'}`);
  }

  const [privateKey, publicKey] = result.stdout
    .trim()
    .split('\n')
    .map((value) => value.trim());

  if (!privateKey || !publicKey) {
    throw new Error('the panel container returned no WireGuard keys');
  }

  const wasGenerated = privateKey === fresh.privateKey;

  log.done(wasGenerated ? 'wireguard keys generated' : 'wireguard keys already on the node');

  return { privateKey, publicKey, wasGenerated };
};
