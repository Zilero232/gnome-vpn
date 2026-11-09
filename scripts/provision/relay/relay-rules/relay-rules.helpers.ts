import { arg, line } from '@gnomevpn/scripts/shell';
import { isIP } from 'node:net';
import { unique } from 'remeda';

import type { RelayForward, RelayForwardsInput } from './relay-rules.types';

import { FIREWALL } from '../../remote';
import { RELAY } from './relay-rules.constants';

const confFile = (lines: string[]): string => [...lines, ''].join('\n');

const targetsOf = (forwards: RelayForward[]): string[] => unique(forwards.map((forward) => forward.target));

export const relayForwards = ({ relay, nodes }: RelayForwardsInput): RelayForward[] =>
  relay.routes.map(({ countryCode, port }) => {
    const node = nodes.find((candidate) => candidate.countryCode === countryCode);

    if (!node) {
      throw new Error(`the relay routes ${countryCode}, which no node in nodes.json serves`);
    }

    if (isIP(node.host) !== 4) {
      throw new Error(`${node.host} is not an ipv4 address, and nftables forwards to an address`);
    }

    return { port, target: node.host };
  });

export const relayRuleset = (forwards: RelayForward[]): string => {
  const dnat = forwards.flatMap(({ port, target }) =>
    RELAY.protocols.map((protocol) => `    ${protocol} dport ${port} dnat to ${target}:${RELAY.targetPort}`)
  );

  const masquerade = targetsOf(forwards).flatMap((target) =>
    RELAY.protocols.map((protocol) => `    ip daddr ${target} ${protocol} dport ${RELAY.targetPort} masquerade`)
  );

  return confFile([
    `table ip ${RELAY.table}`,
    `delete table ip ${RELAY.table}`,
    `table ip ${RELAY.table} {`,
    '  chain prerouting {',
    '    type nat hook prerouting priority dstnat; policy accept;',
    ...dnat,
    '  }',
    '  chain postrouting {',
    '    type nat hook postrouting priority srcnat; policy accept;',
    ...masquerade,
    '  }',
    '}'
  ]);
};

export const relayUnit = (): string =>
  confFile([
    '[Unit]',
    'Description=GnomeVPN relay forwarding',
    'Wants=network-online.target',
    'After=network-online.target',
    '',
    '[Service]',
    'Type=oneshot',
    'RemainAfterExit=yes',
    `ExecStart=${RELAY.nftBinary} -f ${RELAY.rulesetPath}`,
    `ExecStop=${RELAY.nftBinary} delete table ip ${RELAY.table}`,
    '',
    '[Install]',
    'WantedBy=multi-user.target'
  ]);

export const relaySysctl = (): string => confFile(['net.ipv4.ip_forward = 1']);

export const relayFirewallCommands = (forwards: RelayForward[]): string[] => {
  const routeRules = targetsOf(forwards).flatMap((target) =>
    RELAY.protocols.map((protocol) => line(['ufw', 'route', 'allow', 'proto', protocol, 'to', arg(target), 'port', RELAY.targetPort]))
  );

  return [
    'ufw --force reset',
    'ufw default deny incoming',
    'ufw default allow outgoing',
    'ufw default deny routed',
    line(['ufw', 'limit', `${FIREWALL.sshPort}/tcp`]),
    ...routeRules,
    'ufw --force enable',
    line(['rm', '-f', FIREWALL.backupGlob])
  ];
};
