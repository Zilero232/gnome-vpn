import { adminNodeSchema, UPTIME_HISTORY } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import type { AdminNodeRow } from '../nodes.types';

import { nodeView, peakHistory } from '../nodes.helpers';

const NOW = new Date('2026-10-23T12:00:00.000Z');
const TODAY = new Date('2026-10-23T00:00:00.000Z');

const SECRETS = { apiUrl: 'https://203.0.113.7:2053/secret-panel-path', apiTokenEnvVar: 'XRAY_KEY_DE' };

const row = (overrides: Partial<AdminNodeRow> = {}): AdminNodeRow => ({
  id: 'node-1',
  country: 'Germany',
  countryCode: 'DE',
  city: 'Frankfurt',
  host: '203.0.113.7',
  port: 443,
  isAvailable: true,
  isOverloaded: false,
  displayOrder: 0,
  createdAt: NOW,
  realityPublicKey: 'reality-public-key',
  realityShortId: 'short-id',
  wgPublicKey: null,
  lastHealthyAt: NOW,
  lastCheckedAt: NOW,
  onlineClients: 12,
  onlineUsers: 9,
  uptime: [],
  peaks: [],
  ...SECRETS,
  ...overrides
});

describe('nodeView', () => {
  it('gives an admin the host but never the panel or the keys', () => {
    const node = row();
    const view = adminNodeSchema.parse(nodeView({ node, now: NOW }));
    const json = JSON.stringify(view);

    expect(view.host).toBe(node.host);

    for (const secret of [...Object.values(SECRETS), node.realityPublicKey, node.realityShortId]) {
      expect(json).not.toContain(secret);
    }
  });

  it('shows who is online on a node that answers', () => {
    const node = row();

    expect(nodeView({ node, now: NOW }).online).toEqual({ clients: node.onlineClients, users: node.onlineUsers });
  });

  it('hides the last online count once the node is down, since it is no longer current', () => {
    expect(nodeView({ node: row({ lastHealthyAt: null }), now: NOW }).online).toBeNull();
  });

  it('hides the online count of a node out of rotation', () => {
    expect(nodeView({ node: row({ isAvailable: false }), now: NOW }).online).toBeNull();
  });
});

describe('peakHistory', () => {
  it('returns one entry per day of the window, oldest first, ending today', () => {
    const history = peakHistory({ rows: [], today: TODAY });

    expect(history).toHaveLength(UPTIME_HISTORY.days);
    expect(history.at(-1)?.date).toBe('2026-10-23');
    expect(history.map((day) => day.date)).toEqual([...history.map((day) => day.date)].sort());
  });

  it('puts a recorded peak on its day and leaves days without a record empty', () => {
    const clientsAt = new Date('2026-10-22T19:14:00.000Z');
    const history = peakHistory({
      rows: [{ day: new Date('2026-10-22T00:00:00.000Z'), clients: 37, clientsAt, users: 22, cpu: 64.5, memory: 41 }],
      today: TODAY
    });

    expect(history.at(-2)).toEqual({ date: '2026-10-22', clients: 37, clientsAt: clientsAt.toISOString(), users: 22, cpu: 64.5, memory: 41 });
    expect(history.at(-1)).toEqual({ date: '2026-10-23', clients: null, clientsAt: null, users: null, cpu: null, memory: null });
  });
});
