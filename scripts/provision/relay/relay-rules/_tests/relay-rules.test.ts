import { describe, expect, it } from 'vitest';

import { FIREWALL } from '../../../remote';
import { RELAY } from '../relay-rules.constants';
import { relayFirewallCommands, relayForwards, relayRuleset, relayUnit } from '../relay-rules.helpers';

const netherlands = { host: '203.0.113.10', sshUser: 'root', country: 'Netherlands', countryCode: 'NL' };
const finland = { host: '203.0.113.11', sshUser: 'root', country: 'Finland', countryCode: 'FI' };

const relay = {
  host: '198.51.100.7',
  sshUser: 'root',
  routes: [
    { countryCode: 'NL', tunnelPort: 8443 },
    { countryCode: 'FI', tunnelPort: 9443 }
  ]
};

const forwards = relayForwards({ relay, nodes: [netherlands, finland] });

describe('relayForwards', () => {
  it('points each relay port at the node of its country', () => {
    expect(forwards).toEqual([
      { tunnelPort: 8443, target: netherlands.host },
      { tunnelPort: 9443, target: finland.host }
    ]);
  });

  it('refuses a route to a country with no node', () => {
    expect(() => relayForwards({ relay, nodes: [netherlands] })).toThrow();
  });

  it('refuses a node addressed by name, which nftables cannot forward to', () => {
    expect(() => relayForwards({ relay, nodes: [netherlands, { ...finland, host: 'fi.example.com' }] })).toThrow();
  });
});

describe('relayRuleset', () => {
  const ruleset = relayRuleset(forwards);

  it('forwards both tcp and udp of every relay port to the node tunnel port', () => {
    for (const { tunnelPort, target } of forwards) {
      for (const protocol of RELAY.protocols) {
        expect(ruleset).toContain(`${protocol} dport ${tunnelPort} dnat to ${target}:${RELAY.targetPort}`);
      }
    }
  });

  it('masquerades what it forwards, so the node answers through the relay', () => {
    for (const { target } of forwards) {
      expect(ruleset).toContain(`ip daddr ${target} udp dport ${RELAY.targetPort} masquerade`);
    }
  });

  it('replaces its own table on every load instead of stacking a second copy', () => {
    const lines = ruleset.split('\n');

    expect(lines.indexOf(`delete table ip ${RELAY.table}`)).toBeGreaterThan(lines.indexOf(`table ip ${RELAY.table}`));
    expect(lines.indexOf(`table ip ${RELAY.table} {`)).toBeGreaterThan(lines.indexOf(`delete table ip ${RELAY.table}`));
  });

  it('masquerades a node once even when two ports lead to it', () => {
    const twice = relayRuleset([...forwards, { tunnelPort: 10_443, target: netherlands.host }]);

    expect(twice.split(`ip daddr ${netherlands.host} tcp`)).toHaveLength(2);
  });
});

describe('relayUnit', () => {
  it('loads the ruleset at boot and removes only its own table on stop', () => {
    const unit = relayUnit();

    expect(unit).toContain(`ExecStart=${RELAY.nftBinary} -f ${RELAY.rulesetPath}`);
    expect(unit).toContain(`ExecStop=${RELAY.nftBinary} delete table ip ${RELAY.table}`);
    expect(unit).toContain('WantedBy=multi-user.target');
  });
});

describe('relayFirewallCommands', () => {
  const commands = relayFirewallCommands(forwards);

  it('rebuilds the rules from nothing and keeps ssh rate-limited', () => {
    expect(commands[0]).toBe('ufw --force reset');
    expect(commands).toContain(`ufw limit ${FIREWALL.sshPort}/tcp`);
  });

  it('lets forwarded traffic reach only the node tunnel ports', () => {
    for (const { target } of forwards) {
      for (const protocol of RELAY.protocols) {
        expect(commands).toContain(`ufw route allow proto ${protocol} to ${target} port ${RELAY.targetPort}`);
      }
    }

    expect(commands).toContain('ufw default deny routed');
  });

  it('enables the firewall only after every rule is in place', () => {
    const enable = commands.indexOf('ufw --force enable');

    expect(commands.slice(enable + 1).every((command) => !command.startsWith('ufw '))).toBe(true);
  });
});

describe('relay WireGuard forwarding', () => {
  const routes = [{ countryCode: 'FI', tunnelPort: 9443, wireguardPort: 9820 }];
  const wireguard = relayForwards({ relay: { ...relay, routes }, nodes: [netherlands, finland] });

  it('forwards the WireGuard port of a route over udp to the WireGuard port of the node', () => {
    expect(relayRuleset(wireguard)).toContain(`udp dport 9820 dnat to ${finland.host}:${RELAY.wireguardTargetPort}`);
    expect(relayRuleset(wireguard)).toContain(`ip daddr ${finland.host} udp dport ${RELAY.wireguardTargetPort} masquerade`);
  });

  it('lets the forwarded WireGuard traffic through the firewall, and only over udp', () => {
    const commands = relayFirewallCommands(wireguard);

    expect(commands).toContain(`ufw route allow proto udp to ${finland.host} port ${RELAY.wireguardTargetPort}`);
    expect(commands).not.toContain(`ufw route allow proto tcp to ${finland.host} port ${RELAY.wireguardTargetPort}`);
  });

  it('forwards no WireGuard for a route without a WireGuard port', () => {
    expect(relayRuleset(forwards)).not.toContain(`:${RELAY.wireguardTargetPort}`);
  });
});
