import { arg, line } from '@gnomevpn/scripts/shell';
import { isIP } from 'node:net';
import { isNonNullish, unique } from 'remeda';

import type { RelayForward, RelayForwardsInput } from './relay-rules.types';

import { FIREWALL } from '../../remote';
import { RELAY } from './relay-rules.constants';

const confFile = (lines: string[]): string => [...lines, ''].join('\n');

const targetsOf = (forwards: RelayForward[]): string[] => unique(forwards.map((forward) => forward.target));

const wireguardTargetsOf = (forwards: RelayForward[]): string[] =>
  unique(forwards.filter((forward) => isNonNullish(forward.wireguardPort)).map((forward) => forward.target));

export const relayForwards = ({ relay, nodes }: RelayForwardsInput): RelayForward[] =>
  relay.routes.map(({ countryCode, tunnelPort, wireguardPort }) => {
    const node = nodes.find((candidate) => candidate.countryCode === countryCode);

    if (!node) {
      throw new Error(`the relay routes ${countryCode}, which no node in nodes.json serves`);
    }

    if (isIP(node.host) !== 4) {
      throw new Error(`${node.host} is not an ipv4 address, and nftables forwards to an address`);
    }

    return { tunnelPort, target: node.host, wireguardPort };
  });

export const relayRuleset = (forwards: RelayForward[]): string => {
  const dnat = forwards.flatMap(({ tunnelPort, target, wireguardPort }) => [
    ...RELAY.protocols.map((protocol) => `    ${protocol} dport ${tunnelPort} dnat to ${target}:${RELAY.targetPort}`),
    ...[wireguardPort].filter(isNonNullish).map((wireguard) => `    udp dport ${wireguard} dnat to ${target}:${RELAY.wireguardTargetPort}`)
  ]);

  const masquerade = [
    ...targetsOf(forwards).flatMap((target) =>
      RELAY.protocols.map((protocol) => `    ip daddr ${target} ${protocol} dport ${RELAY.targetPort} masquerade`)
    ),
    ...wireguardTargetsOf(forwards).map((target) => `    ip daddr ${target} udp dport ${RELAY.wireguardTargetPort} masquerade`)
  ];

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
  const routeRules = [
    ...targetsOf(forwards).flatMap((target) =>
      RELAY.protocols.map((protocol) => line(['ufw', 'route', 'allow', 'proto', protocol, 'to', arg(target), 'port', RELAY.targetPort]))
    ),
    ...wireguardTargetsOf(forwards).map((target) =>
      line(['ufw', 'route', 'allow', 'proto', 'udp', 'to', arg(target), 'port', RELAY.wireguardTargetPort])
    )
  ];

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
