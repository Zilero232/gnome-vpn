import { describe, expect, it } from 'vitest';

import { relayAssignments } from '../relay-assignments.helpers';

const netherlands = { host: '203.0.113.10', sshUser: 'root', country: 'Netherlands', countryCode: 'NL' };
const finland = { host: '203.0.113.11', sshUser: 'root', country: 'Finland', countryCode: 'FI' };
const relay = { host: '198.51.100.7', sshUser: 'root', routes: [{ countryCode: 'FI', tunnelPort: 9443 }] };

describe('relayAssignments', () => {
  it('points a routed node at its relay port', () => {
    expect(relayAssignments({ nodes: [finland], relays: [relay], failedRelays: [] })).toEqual([
      { host: finland.host, relayHost: relay.host, relayPort: 9443, relayWireguardPort: null }
    ]);
  });

  it('clears the relay of a node no relay routes any more', () => {
    expect(relayAssignments({ nodes: [netherlands], relays: [relay], failedRelays: [] })).toEqual([
      { host: netherlands.host, relayHost: null, relayPort: null, relayWireguardPort: null }
    ]);
  });

  it('carries the WireGuard port of a route that forwards one', () => {
    const withWireguard = { ...relay, routes: [{ countryCode: 'FI', tunnelPort: 9443, wireguardPort: 9820 }] };

    expect(relayAssignments({ nodes: [finland], relays: [withWireguard], failedRelays: [] })[0]?.relayWireguardPort).toBe(9820);
  });

  it('leaves a node alone while its relay failed, so a half-set-up relay is never advertised and a working one is never dropped', () => {
    const assignments = relayAssignments({ nodes: [netherlands, finland], relays: [relay], failedRelays: [relay.host] });

    expect(assignments.map((assignment) => assignment.host)).toEqual([netherlands.host]);
  });
});
