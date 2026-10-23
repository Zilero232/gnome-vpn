import type { RegisterNodeInput, RememberNodeSecretsInput } from './node-register.types';

import { log, MASQUERADE_HOST, PORTS } from '../../config';
import { upsertEnvGroup } from '../env-file';
import { nodeKeyName, panelPasswordName, panelPathName } from '../node-credentials';
import { upsertNode } from '../upsert-node';

export const rememberNodeSecrets = async ({ serverEnvPath, countryCode, apiToken, panelPassword, panelPath }: RememberNodeSecretsInput) => {
  await upsertEnvGroup({
    filePath: serverEnvPath,
    entries: [
      { key: panelPathName(countryCode), value: panelPath },
      { key: panelPasswordName(countryCode), value: panelPassword },
      { key: nodeKeyName(countryCode), value: apiToken }
    ]
  });

  log.done('the panel secrets are saved to .env.nodes');
};

export const registerNode = async ({ config, prisma, panel, cert }: RegisterNodeInput): Promise<boolean> => {
  log.step('writing the node row');

  const { wasExisting } = await upsertNode({
    prisma,
    input: {
      country: config.country,
      countryCode: config.countryCode,
      city: config.city,
      host: config.host,
      port: PORTS.hysteria,
      serverName: MASQUERADE_HOST,
      certFingerprint: cert.certFingerprint,
      realityPublicKey: cert.realityPublicKey,
      realityShortId: cert.realityShortId,
      wgPublicKey: cert.wgPublicKey,
      apiUrl: panel.baseUrl,
      apiTokenEnvVar: nodeKeyName(config.countryCode)
    }
  });

  log.done(wasExisting ? 'the node row was updated' : 'the node row was created');

  return wasExisting;
};
