import { NODE_STATE, nodeStatusSchema, serverStatusSchema, TUNNEL_PROTOCOL } from '@gnomevpn/schemas';
import { subMinutes, subSeconds } from 'date-fns';
import { describe, expect, it } from 'vitest';

import type { StatusNodeRow } from '../node-status.types';

import { nodeStatus } from '../node-status';

const NOW = new Date('2026-10-23T12:00:30Z');

const ROW: StatusNodeRow = {
  countryCode: 'NL',
  realityPublicKey: 'pub',
  realityShortId: 'ab',
  wgPublicKey: null,
  lastHealthyAt: subMinutes(NOW, 1),
  lastCheckedAt: subSeconds(subMinutes(NOW, 1), 2),
  isOverloaded: false,
  uptime: [{ day: new Date('2026-10-23T00:00:00Z'), checkedMinutes: 720, upMinutes: 720 }]
};

const LOCATING_ROW = { ...ROW, id: 'c3f1', host: '203.0.113.10', port: 443, apiUrl: 'https://203.0.113.10:2053/secret', serverName: 'nl.example' };

describe('nodeStatus', () => {
  it('builds a view the public schema accepts as it is', () => {
    expect(nodeStatusSchema.safeParse(nodeStatus({ node: ROW, now: NOW })).success).toBe(true);
  });

  it('carries nothing that locates a node, even when the row it is given does', () => {
    const view = nodeStatus({ node: LOCATING_ROW, now: NOW });

    expect(Object.keys(view).sort()).toEqual(Object.keys(nodeStatusSchema.shape).sort());
    expect(JSON.stringify(view)).not.toContain(LOCATING_ROW.host);
    expect(JSON.stringify(view)).not.toContain(LOCATING_ROW.id);
  });

  it('joins the protocols, the state and the history of one node', () => {
    const view = nodeStatus({ node: ROW, now: NOW });

    expect(view.protocols).toEqual([TUNNEL_PROTOCOL.hysteria2, TUNNEL_PROTOCOL.vless]);
    expect(view.state).toBe(NODE_STATE.up);
    expect(view.uptime).toBe(1);
    expect(view.checkedAt).toBe(ROW.lastCheckedAt?.toISOString());
  });

  it('reports a node never checked with no check time', () => {
    expect(nodeStatus({ node: { ...ROW, lastCheckedAt: null }, now: NOW }).checkedAt).toBeNull();
  });
});

describe('serverStatusSchema', () => {
  it('strips a field the view does not name, so a wider select cannot leak it', () => {
    const parsed = serverStatusSchema.parse({ nodes: [{ ...nodeStatus({ node: ROW, now: NOW }), host: LOCATING_ROW.host }] });

    expect(parsed.nodes.at(0)).not.toHaveProperty('host');
  });
});
