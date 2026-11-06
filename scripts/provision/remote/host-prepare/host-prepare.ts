import type { PrepareHostInput } from './host-prepare.types';

import { configureFirewall } from '../firewall';
import { ensureDocker, ensureFail2ban, ensureJq, ensureUfw } from '../host-packages';
import { tuneHost } from '../host-tuning';
import { shipStack } from '../xray-stack';

export const prepareHost = async ({ ssh, xrayComposeContent, panelSources }: PrepareHostInput) => {
  await ensureDocker(ssh);
  await ensureJq(ssh);
  await ensureFail2ban(ssh);
  await ensureUfw(ssh);
  await configureFirewall({ ssh, panelSources });
  await tuneHost(ssh);

  await shipStack({ ssh, composeContent: xrayComposeContent });
};
