import type { SshClient } from '@gnomevpn/scripts/ssh';

import type { EnsuredKeyFiles, EnsuredRealityKeys, EnsuredWireguardKeys, EnsureKeyFilesInput } from './key-files.types';

import { generateRealityKeys, generateRealityShortId } from '../../../../apps/server/src/modules/peers/lib/reality-keys';
import { generateWireguardKeys } from '../../../../apps/server/src/modules/peers/lib/wireguard-keys';
import { log, NODE_FILES } from '../../config';
import { inContainer } from '../xray-stack';
import { seedKeyFilesScript } from './key-files.helpers';

export const ensureKeyFiles = async ({ ssh, label, seed }: EnsureKeyFilesInput): Promise<EnsuredKeyFiles> => {
  log.step(`ensuring the ${label} server keys`);

  const result = await ssh.run(inContainer(seedKeyFilesScript({ dir: NODE_FILES.dir, seed })));
  const values = result.stdout
    .trim()
    .split('\n')
    .map((value) => value.trim());

  if (values.length !== seed.length || values.some((value) => value.length === 0)) {
    throw new Error(`the node read back ${values.length} of ${seed.length} ${label} key files, some of them empty`);
  }

  const wasGenerated = values[0] === seed[0].value;

  log.done(wasGenerated ? `${label} keys generated` : `${label} keys already on the node`);

  return { values, wasGenerated };
};

export const ensureRealityKeys = async (ssh: SshClient): Promise<EnsuredRealityKeys> => {
  const fresh = generateRealityKeys();

  const { values, wasGenerated } = await ensureKeyFiles({
    ssh,
    label: 'reality',
    seed: [
      { path: NODE_FILES.realityKey, value: fresh.privateKey },
      { path: NODE_FILES.realityPub, value: fresh.publicKey },
      { path: NODE_FILES.realitySid, value: generateRealityShortId() }
    ]
  });

  const [privateKey, publicKey, shortId] = values;

  return { privateKey, publicKey, shortId, wasGenerated };
};

export const ensureWireguardKeys = async (ssh: SshClient): Promise<EnsuredWireguardKeys> => {
  const fresh = generateWireguardKeys();

  const { values, wasGenerated } = await ensureKeyFiles({
    ssh,
    label: 'wireguard',
    seed: [
      { path: NODE_FILES.wgKey, value: fresh.privateKey },
      { path: NODE_FILES.wgPub, value: fresh.publicKey }
    ]
  });

  const [privateKey, publicKey] = values;

  return { privateKey, publicKey, wasGenerated };
};
