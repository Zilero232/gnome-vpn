import { arg, line } from '@gnomevpn/scripts/shell';
import { SshClient } from '@gnomevpn/scripts/ssh';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, posix } from 'node:path';

import type { SyncResult, SyncToProductionInput } from './node-sync.types';

import { describeError } from '../../../../apps/server/src/common/lib/describe-error';
import { ENV_NODES, HEREDOC_NONCE_BYTES, PRODUCTION_SSH } from './node-sync.constants';
import { applyServerEnvCommand, applySqlCommand, buildNodeSync, installEnvFileCommand, isSameEnvFile, readFileCommand } from './node-sync.helpers';

const defaultKeyPath = (): string | undefined =>
  PRODUCTION_SSH.keyNames.map((name) => join(homedir(), '.ssh', name)).find((path) => existsSync(path));

export const syncToProduction = async ({ nodes, envNodes, pruneMissing }: SyncToProductionInput): Promise<SyncResult> => {
  const host = process.env.PROVISION_SSH_HOST;
  const username = process.env.PROVISION_SSH_USER ?? PRODUCTION_SSH.defaultUser;
  const password = process.env.PROVISION_SSH_PASSWORD;
  const privateKeyPath = process.env.PROVISION_SSH_KEY ?? (password ? undefined : defaultKeyPath());
  const deployPath = process.env.PROVISION_DEPLOY_PATH ?? PRODUCTION_SSH.defaultDeployPath;

  if (!host) {
    return { status: 'skipped', message: 'PROVISION_SSH_HOST is not set' };
  }

  if (!(password || privateKeyPath)) {
    return { status: 'skipped', message: 'neither PROVISION_SSH_PASSWORD nor an ssh key is available' };
  }

  if (nodes.length === 0) {
    return { status: 'skipped', message: 'the local database holds no nodes' };
  }

  const ssh = new SshClient();
  const envPath = posix.join(deployPath, ENV_NODES.fileName);

  try {
    await ssh.connect({ host, username, password, privateKeyPath });

    const delimiter = `SQL_${randomBytes(HEREDOC_NONCE_BYTES).toString('hex')}`;

    await ssh.run(applySqlCommand({ deployPath, sql: buildNodeSync({ nodes, pruneMissing }), delimiter }));

    const current = await ssh.exec(readFileCommand(envPath));
    const previous = current.exitCode === 0 ? current.stdout : null;
    const isChanged = !isSameEnvFile({ previous, next: envNodes });

    if (isChanged) {
      const uploadPath = `${envPath}${ENV_NODES.uploadSuffix}`;

      await ssh.putFile({ content: envNodes, remotePath: uploadPath });
      await ssh.run(installEnvFileCommand({ uploadPath, targetPath: envPath }));
    } else {
      await ssh.run(line(['chmod', ENV_NODES.mode, arg(envPath)]));
    }

    const applied = await ssh.exec(applyServerEnvCommand(deployPath));

    if (applied.exitCode !== 0) {
      return { status: 'failed', message: `nodes written, but the server did not come up healthy: ${(applied.stderr || applied.stdout).trim()}` };
    }

    return {
      status: 'synced',
      message: isChanged
        ? `synced ${nodes.length} node(s) and applied the new .env.nodes to the server`
        : `synced ${nodes.length} node(s); .env.nodes is unchanged`
    };
  } catch (error) {
    return { status: 'failed', message: describeError(error) };
  } finally {
    ssh.dispose();
  }
};
