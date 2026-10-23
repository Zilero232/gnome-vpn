import { describe, expect, it } from 'vitest';

import type { SyncableNode } from '../node-sync.types';

import { applyServerEnvCommand, applySqlCommand, buildNodeSync, installEnvFileCommand, isSameEnvFile } from '../node-sync.helpers';

const node: SyncableNode = {
  country: 'Netherlands',
  countryCode: 'NL',
  city: null,
  host: '203.0.113.10',
  port: 443,
  serverName: 'www.bing.com',
  certFingerprint: null,
  realityPublicKey: null,
  realityShortId: null,
  wgPublicKey: 'wg-pub+/=',
  apiUrl: 'http://203.0.113.10:2053/abc',
  apiTokenEnvVar: 'XRAY_KEY_NL',
  displayOrder: 0
};

describe('buildNodeSync', () => {
  it('carries the wireguard key into both the update and the insert', () => {
    const sql = buildNodeSync({ nodes: [node], pruneMissing: true });

    expect(sql).toContain("'wg-pub+/='");
    expect(sql).toContain('wg_public_key = i.wg_public_key');
    expect(sql).toContain('i.wg_public_key');
  });

  it('leaves an existing node in or out of rotation as an admin put it, and puts only a new node into rotation', () => {
    const sql = buildNodeSync({ nodes: [node], pruneMissing: true });
    const update = sql.slice(sql.indexOf('UPDATE node SET'), sql.indexOf('INSERT INTO node'));

    expect(update).not.toContain('is_available');
    expect(sql.slice(sql.indexOf('INSERT INTO node'))).toContain('is_available');
  });

  it('refuses an empty list, which would turn into deleting every production node', () => {
    expect(() => buildNodeSync({ nodes: [], pruneMissing: true })).toThrow();
  });

  it('runs inside one transaction', () => {
    const sql = buildNodeSync({ nodes: [node], pruneMissing: true });

    expect(sql.startsWith('BEGIN;')).toBe(true);
    expect(sql.trimEnd().endsWith('COMMIT;')).toBe(true);
  });

  it('escapes a quote in a value rather than ending the literal', () => {
    expect(buildNodeSync({ nodes: [{ ...node, city: "Hof van 's-Hertogenbosch" }], pruneMissing: true })).toContain("'Hof van ''s-Hertogenbosch'");
  });

  it('writes a missing value as NULL, not as the text null', () => {
    expect(buildNodeSync({ nodes: [node], pruneMissing: true })).toContain("'Netherlands', 'NL', NULL,");
  });

  it('deletes production nodes missing from the list only when asked to', () => {
    expect(buildNodeSync({ nodes: [node], pruneMissing: true })).toContain('DELETE FROM node WHERE host NOT IN');
    expect(buildNodeSync({ nodes: [node], pruneMissing: false })).not.toContain('DELETE FROM node');
  });

  it('removes the WireGuard config devices whose peers it revokes, so they do not hold a slot with no config', () => {
    const sql = buildNodeSync({ nodes: [node], pruneMissing: false });

    expect(sql).toContain("DELETE FROM device WHERE key LIKE 'wg:%' AND id IN (");
    expect(sql.indexOf('DELETE FROM device')).toBeLessThan(sql.indexOf('UPDATE peer'));
  });

  it('removes the WireGuard config devices of a pruned node before the node takes their peers with it', () => {
    const sql = buildNodeSync({ nodes: [node], pruneMissing: true });
    const pruneDevices = sql.indexOf("WHERE p.protocol = 'wireguard' AND n.host NOT IN ('203.0.113.10')");

    expect(pruneDevices).toBeGreaterThan(-1);
    expect(pruneDevices).toBeLessThan(sql.indexOf('DELETE FROM node'));
  });

  it('revokes the peers of a changed node rather than deleting them, so reconcile removes their clients from the panel', () => {
    const sql = buildNodeSync({ nodes: [node], pruneMissing: true });

    expect(sql).not.toContain('DELETE FROM peer');
    expect(sql).toContain("UPDATE peer SET revoked_at = now(), state = 'disabled' WHERE revoked_at IS NULL AND node_id IN (");
  });

  it('revokes only the wireguard peers of a node whose wireguard key changed', () => {
    const sql = buildNodeSync({ nodes: [node], pruneMissing: true });

    expect(sql).toContain(
      "UPDATE peer SET revoked_at = now(), state = 'disabled' WHERE protocol = 'wireguard' AND revoked_at IS NULL AND node_id IN ("
    );

    expect(sql).toContain('n.wg_public_key IS DISTINCT FROM i.wg_public_key');
  });
});

describe('applySqlCommand', () => {
  const sql = 'SELECT 1;';
  const delimiter = 'SQL_x';

  it('quotes a deploy path an operator could have set to anything', () => {
    const command = applySqlCommand({ deployPath: '/opt/my app; rm -rf /', sql, delimiter });

    expect(command.startsWith("cd '/opt/my app; rm -rf /' && ")).toBe(true);
  });

  it('closes the heredoc with the delimiter it opened', () => {
    const command = applySqlCommand({ deployPath: '/opt/gnomevpn', sql, delimiter });

    expect(command.endsWith([`<<'${delimiter}'`, sql, delimiter].join('\n'))).toBe(true);
  });

  it('refuses sql that would close its own heredoc early', () => {
    expect(() => applySqlCommand({ deployPath: '/opt/gnomevpn', sql: [sql, delimiter, 'rm -rf /'].join('\n'), delimiter })).toThrow();
  });
});

describe('applyServerEnvCommand', () => {
  it('lets compose recreate the server only when its env changed, from inside the deploy path, and waits for its healthcheck', () => {
    expect(applyServerEnvCommand('/opt/gnomevpn')).toBe('cd /opt/gnomevpn && docker compose up -d --no-deps --wait server');
  });
});

describe('installEnvFileCommand', () => {
  it('locks the uploaded file down before moving it into place', () => {
    expect(installEnvFileCommand({ uploadPath: '/opt/gnomevpn/.env.nodes.upload', targetPath: '/opt/gnomevpn/.env.nodes' })).toBe(
      'chmod 600 /opt/gnomevpn/.env.nodes.upload && mv -f /opt/gnomevpn/.env.nodes.upload /opt/gnomevpn/.env.nodes'
    );
  });
});

describe('isSameEnvFile', () => {
  it('treats a file that differs only by the trailing newline as the same', () => {
    expect(isSameEnvFile({ previous: 'XRAY_KEY_NL=a', next: 'XRAY_KEY_NL=a\n' })).toBe(true);
  });

  it('sees a rotated token as a change', () => {
    expect(isSameEnvFile({ previous: 'XRAY_KEY_NL=a', next: 'XRAY_KEY_NL=b\n' })).toBe(false);
  });

  it('sees a missing remote file as a change', () => {
    expect(isSameEnvFile({ previous: null, next: '' })).toBe(false);
  });
});
