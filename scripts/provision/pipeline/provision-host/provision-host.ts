import { SshClient } from '@gnomevpn/scripts/ssh';

import type { ProvisionHostInput, ProvisionResult } from './provision-host.types';

import { describeError } from '../../../../apps/server/src/common/lib/describe-error';
import { generateAuth } from '../../../../apps/server/src/lib/xray';
import { installInbounds } from '../../inbound';
import { registerNode, rememberNodeSecrets, resolveNodeCredentials } from '../../node';
import { configurePanel, openPanelSession, prepareHost } from '../../remote';

export const provisionHost = async ({ config, prisma, serverEnvPath, xrayComposeContent }: ProvisionHostInput): Promise<ProvisionResult> => {
  const ssh = new SshClient();
  const outcome = { host: config.host, country: config.country };

  try {
    const previous = await prisma.node.findUnique({
      where: { host: config.host },
      select: { certFingerprint: true, realityPublicKey: true, wgPublicKey: true }
    });

    await ssh.connect({ host: config.host, username: config.sshUser, password: config.sshPassword });

    const { password, panelPath, apiToken } = await resolveNodeCredentials({
      envFilePath: serverEnvPath,
      countryCode: config.countryCode
    });

    const auth = generateAuth();

    await prepareHost({ ssh, xrayComposeContent });

    const token = await configurePanel({ ssh, password, panelPath, knownToken: apiToken });

    await rememberNodeSecrets({ serverEnvPath, countryCode: config.countryCode, apiToken: token, panelPassword: password, panelPath });

    const panel = await openPanelSession({ host: config.host, panelPath, token });
    const installed = await installInbounds({ ssh, panel, auth });
    const wasExisting = await registerNode({ config, prisma, panel, cert: installed });

    const lostCert = Boolean(previous?.certFingerprint) && installed.certWasGenerated;
    const lostRealityKeys = Boolean(previous?.realityPublicKey) && installed.realityWasGenerated;
    const lostWireguardKeys = Boolean(previous?.wgPublicKey) && installed.wgWasGenerated;

    return {
      ...outcome,
      status: wasExisting ? 'updated' : 'provisioned',
      ...(lostCert && { lostCert }),
      ...(lostRealityKeys && { lostRealityKeys }),
      ...(lostWireguardKeys && { lostWireguardKeys })
    };
  } catch (error) {
    return {
      ...outcome,
      status: 'failed',
      error: describeError(error)
    };
  } finally {
    ssh.dispose();
  }
};
