import { arg, line } from '@gnomevpn/scripts/shell';
import { isIP } from 'node:net';
import { isEmpty, unique } from 'remeda';

import { PORTS } from '../../config';
import { FIREWALL } from './firewall.constants';

const panelRules = (sources: string[]): string[] => {
  if (isEmpty(sources)) {
    return [line(['ufw', 'allow', `${PORTS.panel}/tcp`])];
  }

  return sources.map((source) => line(['ufw', 'allow', 'from', arg(source), 'to', 'any', 'port', PORTS.panel, 'proto', 'tcp']));
};

export const validSources = (sources: string[]): string[] => {
  const trimmed = sources.map((source) => source.trim());
  const addresses = trimmed.filter((source) => isIP(source) !== 0);

  return unique(addresses);
};

export const firewallCommands = (sources: string[]): string[] => {
  const tunnelRules = FIREWALL.tunnelRules.map((rule) => line(['ufw', 'allow', rule]));

  return [
    'ufw --force reset',
    'ufw default deny incoming',
    'ufw default allow outgoing',
    line(['ufw', 'limit', `${FIREWALL.sshPort}/tcp`]),
    ...tunnelRules,
    ...panelRules(validSources(sources)),
    'ufw --force enable',
    line(['rm', '-f', FIREWALL.backupGlob])
  ];
};
