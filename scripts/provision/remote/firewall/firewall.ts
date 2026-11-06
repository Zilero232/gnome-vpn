import { all } from '@gnomevpn/scripts/shell';
import { lookup } from 'node:dns/promises';
import { isEmpty } from 'remeda';

import type { ConfigureFirewallInput } from './firewall.types';

import { log } from '../../config';
import { FIREWALL } from './firewall.constants';
import { firewallCommands, validSources } from './firewall.helpers';

export const productionSources = async (): Promise<string[]> => {
  const host = process.env[FIREWALL.productionHostEnv];

  if (!host) {
    return [];
  }

  const addresses = await lookup(host, { all: true, family: 4 });

  return addresses.map(({ address }) => address);
};

export const configureFirewall = async ({ ssh, panelSources }: ConfigureFirewallInput): Promise<void> => {
  if (isEmpty(panelSources)) {
    log.warn(`${FIREWALL.productionHostEnv} is not set, so the panel port stays open to everyone`);
  }

  const workstation = (await ssh.run(FIREWALL.clientAddressCommand)).stdout;
  const allowed = isEmpty(panelSources) ? [] : validSources([...panelSources, workstation]);
  const panelAudience = isEmpty(allowed) ? 'everyone' : allowed.join(', ');

  log.step(`closing everything but ssh, the tunnels and the panel for ${panelAudience}`);

  await ssh.run(all(firewallCommands(allowed)));

  log.done('the firewall is on');
};
