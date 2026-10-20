import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prop } from 'remeda';

import type { NodeConfig, SyncResult } from './node';
import type { ProvisionResult } from './pipeline';

import { basePrisma } from '../../apps/server/src/core';
import { log } from './config';
import { loadNodesConfig, pruneNodes, syncToProduction } from './node';
import { formatSummary, provisionHost } from './pipeline';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

const PATHS = {
  nodesConfig: resolve(ROOT, 'nodes.json'),
  serverEnv: resolve(ROOT, '.env.nodes'),
  xrayCompose: resolve(ROOT, 'infra', 'xray', 'docker-compose.yml')
} as const;

const warnLosses = (result: ProvisionResult) => {
  if (result.lostCert) {
    log.warn('the node certificate was missing and had to be regenerated');
    log.warn('every Hysteria2 entry pinned to the old fingerprint fails until its subscription refreshes');
  }

  if (result.lostRealityKeys) {
    log.warn('the reality server key was missing and had to be regenerated');
    log.warn('every VLESS entry issued for this node before now is dead');
  }

  if (result.lostWireguardKeys) {
    log.warn('the wireguard server key was missing and had to be regenerated');
    log.warn('every WireGuard entry issued for this node before now is dead');
  }
};

const provisionAll = async (nodes: NodeConfig[]): Promise<ProvisionResult[]> => {
  const xrayComposeContent = await readFile(PATHS.xrayCompose, 'utf8');
  const results: ProvisionResult[] = [];

  for (const config of nodes) {
    log.tint(config.host);
    log.step(`${config.country} (${config.host})`);

    const result = await provisionHost({
      config,
      prisma: basePrisma,
      serverEnvPath: PATHS.serverEnv,
      xrayComposeContent
    });

    results.push(result);
    log.done(`${result.status}${result.error ? `: ${result.error}` : ''}`);
    warnLosses(result);
    log.untint();
  }

  return results;
};

const pruneStale = async (nodes: NodeConfig[]) => {
  const { removedKeys, removedNodes } = await pruneNodes({
    prisma: basePrisma,
    nodes,
    serverEnvPath: PATHS.serverEnv
  });

  if (removedKeys.length > 0) {
    log.info(`removed stale keys: ${removedKeys.join(', ')}`);
  }

  if (removedNodes.length > 0) {
    log.info(`removed ${removedNodes.length} node(s) missing from nodes.json: ${removedNodes.join(', ')}`);
  }
};

const pushToProduction = async (pruneMissing: boolean): Promise<SyncResult> => {
  const nodes = await basePrisma.node.findMany({ orderBy: { createdAt: 'asc' } });
  const envNodes = await readFile(PATHS.serverEnv, 'utf8');

  log.step('syncing production');

  const result = await syncToProduction({ nodes, envNodes, pruneMissing });

  if (result.status === 'failed') {
    log.warn(`production sync failed: ${result.message}`);
  } else {
    log.done(`${result.status}: ${result.message}`);
  }

  return result;
};

const main = async () => {
  const nodes = await loadNodesConfig(PATHS.nodesConfig);

  try {
    const results = await provisionAll(nodes);
    const hasFailed = results.map(prop('status')).includes('failed');

    log.info(`\nsummary:\n${formatSummary(results)}`);

    if (hasFailed) {
      log.warn('a host failed, so nodes missing from nodes.json are kept until a clean run');
    } else {
      await pruneStale(nodes);
    }

    const sync = await pushToProduction(!hasFailed);

    process.exitCode = hasFailed || sync.status === 'failed' ? 1 : 0;
  } finally {
    await basePrisma.$disconnect();
  }
};

await main();
