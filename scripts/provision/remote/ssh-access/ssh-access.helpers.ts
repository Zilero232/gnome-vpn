import { arg, line } from '@gnomevpn/scripts/shell';

import { defaultKeyPath, SSH_KEY } from '../../config';
import { SSHD } from './ssh-access.constants';

export const nodeKeyPath = (): string | undefined => process.env[SSH_KEY.nodeEnv] ?? defaultKeyPath();

export const sshdHardening = (): string => {
  const directives = Object.entries(SSHD.settings).map(([key, value]) => `${key} ${value}`);

  return [...directives, ''].join('\n');
};

export const authorizeKeyCommand = (publicKey: string): string => {
  const hasKey = line(['grep', '-qxF', arg(publicKey), '~/.ssh/authorized_keys']);
  const appendKey = `${line(['echo', arg(publicKey)])} >> ~/.ssh/authorized_keys`;

  return ['install -d -m 700 ~/.ssh', 'touch ~/.ssh/authorized_keys', 'chmod 600 ~/.ssh/authorized_keys', `${hasKey} || ${appendKey}`].join(' && ');
};
