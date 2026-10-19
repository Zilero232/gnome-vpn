import { SshClient } from '@gnomevpn/scripts/ssh';

import type { ProvisionHostInput, ProvisionResult } from './provision-host.types';

import { generateAuth } from '../../../../apps/server/src/lib/xray';
import { installInbounds } from '../../inbound';
import { registerNode, resolveNodeCredentials } from '../../node';
import { prepareHost, startPanel } from '../../remote';

export const provisionHost = async ({ config, prisma, serverEnvPath, xrayComposeContent }: ProvisionHostInput): Promise<ProvisionResult> => {
  const ssh = new SshClient();
  const outcome = { host: config.host, country: config.country };

  try {
    await ssh.connect({ host: config.host, username: config.sshUser, password: config.sshPassword });

    const { password, panelPath, apiToken } = await resolveNodeCredentials({
      envFilePath: serverEnvPath,
      countryCode: config.countryCode
    });

    const auth = generateAuth();

    await prepareHost({ ssh, xrayComposeContent });

    const panel = await startPanel({ ssh, host: config.host, password, panelPath, knownToken: apiToken });
    const cert = await installInbounds({ ssh, panel, auth });

    const previous = await prisma.node.findFirst({ where: { host: config.host }, select: { wgPublicKey: true } });
    const wasExisting = await registerNode({ config, prisma, serverEnvPath, panel, password, panelPath, auth, cert });

    const lostRealityKeys = wasExisting && cert.realityWasGenerated;
    const lostWireguardKeys = Boolean(previous?.wgPublicKey) && cert.wgWasGenerated;

    return {
      ...outcome,
      status: wasExisting ? 'updated' : 'provisioned',
      ...(lostRealityKeys && { lostRealityKeys }),
      ...(lostWireguardKeys && { lostWireguardKeys })
    };
  } catch (error) {
    return {
      ...outcome,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    ssh.dispose();
  }
};
