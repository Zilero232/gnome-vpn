import { all, line } from '@gnomevpn/scripts/shell';
import { SshClient } from '@gnomevpn/scripts/ssh';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

import type { CanLogInWithKeyInput, NodeSshInput } from './ssh-access.types';

import { log } from '../../config';
import { SSHD } from './ssh-access.constants';
import { authorizeKeyCommand, nodeKeyPath, sshdHardening } from './ssh-access.helpers';

const canLogInWithKey = async ({ config, privateKeyPath }: CanLogInWithKeyInput): Promise<boolean> => {
  const probe = new SshClient();

  try {
    await probe.connect({ host: config.host, username: config.sshUser, privateKeyPath });
    await probe.run('true');

    return true;
  } catch {
    return false;
  } finally {
    probe.dispose();
  }
};

export const connectNode = async ({ ssh, config }: NodeSshInput): Promise<void> => {
  const privateKeyPath = nodeKeyPath();

  if (privateKeyPath && (await canLogInWithKey({ config, privateKeyPath }))) {
    await ssh.connect({ host: config.host, username: config.sshUser, privateKeyPath });

    return;
  }

  if (!config.sshPassword) {
    throw new Error('the node takes no key of ours and nodes.json gives it no password');
  }

  await ssh.connect({ host: config.host, username: config.sshUser, password: config.sshPassword });
};

export const lockToKey = async ({ ssh, config }: NodeSshInput): Promise<void> => {
  const privateKeyPath = nodeKeyPath();
  const publicKeyPath = `${privateKeyPath}.pub`;

  if (!privateKeyPath || !existsSync(publicKeyPath)) {
    log.warn('no ssh key pair to install, so the node keeps password logins');

    return;
  }

  log.step('authorising our ssh key');

  const publicKey = (await readFile(publicKeyPath, 'utf8')).trim();

  await ssh.run(authorizeKeyCommand(publicKey));

  if (!(await canLogInWithKey({ config, privateKeyPath }))) {
    throw new Error('the key was installed but a fresh login with it failed, so passwords stay on');
  }

  log.step(`turning password logins off in ${SSHD.dropInPath}`);

  await ssh.putFile({ content: sshdHardening(), remotePath: SSHD.dropInPath });
  await ssh.run(all([line(['sshd', '-t']), 'systemctl reload ssh']));

  log.done('ssh takes our key only');
};
