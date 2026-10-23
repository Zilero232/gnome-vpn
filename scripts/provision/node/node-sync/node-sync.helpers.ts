import { all, arg, line, quiet } from '@gnomevpn/scripts/shell';
import { escapeLiteral } from 'pg';

import type { ApplySqlCommandInput, BuildNodeSyncInput, InstallEnvFileCommandInput, IsSameEnvFileInput, SyncableNode } from './node-sync.types';

import { DEVICE_KEY } from '../../../../apps/server/src/modules/devices/config';
import { ENV_NODES, NODE_SYNC_SQL } from './node-sync.constants';

const quote = (value: string | null) => (value === null ? 'NULL' : escapeLiteral(value));

const row = (node: SyncableNode) =>
  [
    quote(node.country),
    quote(node.countryCode),
    quote(node.city),
    quote(node.host),
    String(node.port),
    quote(node.serverName),
    quote(node.certFingerprint),
    quote(node.realityPublicKey),
    quote(node.realityShortId),
    quote(node.wgPublicKey),
    quote(node.apiUrl),
    quote(node.apiTokenEnvVar),
    String(node.displayOrder)
  ].join(', ');

export const buildNodeSync = ({ nodes, pruneMissing }: BuildNodeSyncInput) => {
  if (nodes.length === 0) {
    throw new Error('refusing to sync an empty node list, which would delete every production node');
  }

  const values = nodes.map((node) => `  (${row(node)})`).join(',\n');
  const hosts = nodes.map((node) => quote(node.host)).join(', ');
  const wireguardDevices = escapeLiteral(`${DEVICE_KEY.wireguard}%`);
  const revoke = NODE_SYNC_SQL.revokePeer;

  return [
    'BEGIN;',
    '',
    'CREATE TEMP TABLE incoming_node (',
    '  country text, country_code text, city text, host text, port int,',
    '  server_name text, cert_fingerprint text,',
    '  reality_public_key text, reality_short_id text, wg_public_key text,',
    '  api_url text, api_token_env_var text, display_order int',
    ') ON COMMIT DROP;',
    '',
    'INSERT INTO incoming_node VALUES',
    `${values};`,
    '',
    ...(pruneMissing
      ? [
          `DELETE FROM device WHERE key LIKE ${wireguardDevices} AND id IN (`,
          '  SELECT p.device_id FROM peer p JOIN node n ON n.id = p.node_id',
          `  WHERE p.protocol = 'wireguard' AND n.host NOT IN (${hosts})`,
          ');',
          '',
          `DELETE FROM node WHERE host NOT IN (${hosts});`,
          ''
        ]
      : []),
    `DELETE FROM device WHERE key LIKE ${wireguardDevices} AND id IN (`,
    '  SELECT p.device_id FROM peer p',
    '  JOIN node n ON n.id = p.node_id JOIN incoming_node i ON n.host = i.host',
    "  WHERE p.protocol = 'wireguard' AND (",
    '    n.port <> i.port OR n.server_name <> i.server_name OR n.wg_public_key IS DISTINCT FROM i.wg_public_key',
    '  )',
    ');',
    '',
    `UPDATE peer SET ${revoke} WHERE revoked_at IS NULL AND node_id IN (`,
    '  SELECT n.id FROM node n JOIN incoming_node i ON n.host = i.host',
    '  WHERE n.port <> i.port OR n.server_name <> i.server_name',
    ');',
    '',
    `UPDATE peer SET ${revoke} WHERE protocol = 'wireguard' AND revoked_at IS NULL AND node_id IN (`,
    '  SELECT n.id FROM node n JOIN incoming_node i ON n.host = i.host',
    '  WHERE n.wg_public_key IS DISTINCT FROM i.wg_public_key',
    ');',
    '',
    'UPDATE node SET',
    '  country = i.country, country_code = i.country_code, city = i.city,',
    '  port = i.port, server_name = i.server_name,',
    '  cert_fingerprint = i.cert_fingerprint,',
    '  reality_public_key = i.reality_public_key, reality_short_id = i.reality_short_id,',
    '  wg_public_key = i.wg_public_key,',
    '  api_url = i.api_url, api_token_env_var = i.api_token_env_var,',
    '  display_order = i.display_order',
    'FROM incoming_node i WHERE node.host = i.host;',
    '',
    'INSERT INTO node (',
    '  country, country_code, city, host, port, server_name, cert_fingerprint,',
    '  reality_public_key, reality_short_id, wg_public_key,',
    '  api_url, api_token_env_var, display_order, is_available',
    ')',
    'SELECT',
    '  i.country, i.country_code, i.city, i.host, i.port, i.server_name, i.cert_fingerprint,',
    '  i.reality_public_key, i.reality_short_id, i.wg_public_key,',
    '  i.api_url, i.api_token_env_var, i.display_order, true',
    'FROM incoming_node i',
    'WHERE NOT EXISTS (SELECT 1 FROM node n WHERE n.host = i.host);',
    '',
    'COMMIT;'
  ].join('\n');
};

export const applySqlCommand = ({ deployPath, sql, delimiter }: ApplySqlCommandInput) => {
  if (sql.split('\n').includes(delimiter)) {
    throw new Error('the sql contains its own heredoc delimiter');
  }

  const psql = line([
    'docker compose exec -T postgres sh -c',
    arg('psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'),
    `<<'${delimiter}'\n${sql}\n${delimiter}`
  ]);

  return all([line(['cd', arg(deployPath)]), psql]);
};

export const applyServerEnvCommand = (deployPath: string) => all([line(['cd', arg(deployPath)]), 'docker compose up -d --no-deps --wait server']);

export const readFileCommand = (path: string) => quiet(line(['cat', arg(path)]));

export const installEnvFileCommand = ({ uploadPath, targetPath }: InstallEnvFileCommandInput) =>
  all([line(['chmod', ENV_NODES.mode, arg(uploadPath)]), line(['mv', '-f', arg(uploadPath), arg(targetPath)])]);

export const isSameEnvFile = ({ previous, next }: IsSameEnvFileInput) => previous !== null && previous.trim() === next.trim();
