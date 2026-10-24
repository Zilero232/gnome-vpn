import { adminNodeSchema } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { nodeView } from '../nodes.helpers';

const NOW = new Date('2026-10-23T12:00:00.000Z');

describe('nodeView', () => {
  it('gives an admin the host but never the panel or the keys', () => {
    const secrets = { apiUrl: 'https://203.0.113.7:2053/secret-panel-path', apiTokenEnvVar: 'XRAY_KEY_DE' };

    const row = {
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
      uptime: [],
      ...secrets
    };

    const view = adminNodeSchema.parse(nodeView({ node: row, now: NOW }));
    const json = JSON.stringify(view);

    expect(view.host).toBe(row.host);

    for (const secret of [...Object.values(secrets), row.realityPublicKey, row.realityShortId]) {
      expect(json).not.toContain(secret);
    }
  });
});
