import { describe, expect, it } from 'vitest';

import { formatIssues } from '../nodes-config.helpers';
import { nodesConfigSchema } from '../nodes-config.schema';

const node = { host: '203.0.113.10', sshUser: 'root', sshPassword: 'x', country: 'Netherlands', countryCode: 'NL' };
const finland = { ...node, host: '203.0.113.11', country: 'Finland', countryCode: 'FI' };
const relay = { host: '198.51.100.7', sshUser: 'root', routes: [{ countryCode: 'NL', tunnelPort: 8443 }] };

const parse = (raw: unknown) => nodesConfigSchema.safeParse(raw);

describe('nodesConfigSchema', () => {
  it('accepts distinct nodes', () => {
    expect(parse({ nodes: [node, finland] }).success).toBe(true);
  });

  it('reads the old bare list as nodes without relays', () => {
    expect(parse([node, finland]).data).toEqual({ nodes: [node, finland], relays: [] });
  });

  it('refuses two nodes on one country code, whose panel secrets would share env keys', () => {
    expect(parse({ nodes: [node, { ...node, host: '203.0.113.11' }] }).success).toBe(false);
  });

  it('refuses the same host twice', () => {
    expect(parse({ nodes: [node, { ...node, countryCode: 'FI' }] }).success).toBe(false);
  });

  it('refuses a country code that is not two uppercase letters, since it becomes an env key name', () => {
    expect(parse({ nodes: [{ ...node, countryCode: 'N=' }] }).success).toBe(false);
  });
});

describe('nodesConfigSchema relays', () => {
  it('accepts a relay routing one port per node', () => {
    const routes = [
      { countryCode: 'NL', tunnelPort: 8443 },
      { countryCode: 'FI', tunnelPort: 9443 }
    ];

    expect(parse({ nodes: [node, finland], relays: [{ ...relay, routes }] }).success).toBe(true);
  });

  it('refuses a route to a country no node in the file serves', () => {
    expect(parse({ nodes: [node], relays: [{ ...relay, routes: [{ countryCode: 'FI', tunnelPort: 9443 }] }] }).success).toBe(false);
  });

  it('refuses one port forwarded to two nodes', () => {
    const routes = [
      { countryCode: 'NL', tunnelPort: 8443 },
      { countryCode: 'FI', tunnelPort: 8443 }
    ];

    expect(parse({ nodes: [node, finland], relays: [{ ...relay, routes }] }).success).toBe(false);
  });

  it('refuses a WireGuard port that collides with a tunnel port on the same relay', () => {
    const routes = [
      { countryCode: 'NL', tunnelPort: 8443 },
      { countryCode: 'FI', tunnelPort: 9443, wireguardPort: 8443 }
    ];

    expect(parse({ nodes: [node, finland], relays: [{ ...relay, routes }] }).success).toBe(false);
  });

  it('refuses a node routed by two relays, since a node has one relay', () => {
    const second = { ...relay, host: '198.51.100.8' };

    expect(parse({ nodes: [node], relays: [relay, second] }).success).toBe(false);
  });

  it('refuses a port below 1024, where ssh and the well-known services live', () => {
    expect(parse({ nodes: [node], relays: [{ ...relay, routes: [{ countryCode: 'NL', tunnelPort: 22 }] }] }).success).toBe(false);
  });

  it('refuses a relay on a node host, which would forward a node to itself', () => {
    expect(parse({ nodes: [node], relays: [{ ...relay, host: node.host }] }).success).toBe(false);
  });
});

describe('formatIssues', () => {
  it('names the entry an issue belongs to', () => {
    const result = parse({ nodes: [{ ...node, host: '' }] });

    expect(formatIssues(result.error?.issues ?? [])).toContain('nodes[0].host');
  });

  it('names the field for an issue about the list as a whole', () => {
    const result = parse({ nodes: [node, node] });

    expect(formatIssues(result.error?.issues ?? [])).toContain(`countryCode — ${node.countryCode} appears more than once`);
  });
});
