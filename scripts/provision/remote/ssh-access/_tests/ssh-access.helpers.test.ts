import { describe, expect, it } from 'vitest';

import { SSHD } from '../ssh-access.constants';
import { authorizeKeyCommand, sshdHardening } from '../ssh-access.helpers';

const PUBLIC_KEY = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExample gnomevpn';

describe('sshdHardening', () => {
  it('turns every password path off and keeps root on keys', () => {
    const conf = sshdHardening();

    for (const [key, value] of Object.entries(SSHD.settings)) {
      expect(conf).toContain(`${key} ${value}`);
    }
  });

  it('lands in a drop-in that sorts before the cloud-init one, because sshd keeps the first value it reads', () => {
    expect(SSHD.dropInPath.split('/').at(-1)! < '50-cloud-init.conf').toBe(true);
  });
});

describe('authorizeKeyCommand', () => {
  it('appends the key only when the file does not hold it yet, so a second run adds no duplicate', () => {
    const command = authorizeKeyCommand(PUBLIC_KEY);

    expect(command).toMatch(/grep -qxF .+ \|\| echo .+ >> ~\/\.ssh\/authorized_keys$/u);
  });

  it('ends the file with a newline before appending, so the key never glues onto the last line', () => {
    const steps = authorizeKeyCommand(PUBLIC_KEY).split(' && ');
    const newline = steps.findIndex((step) => step.startsWith('sed -i'));
    const append = steps.findIndex((step) => step.includes('>> ~/.ssh/authorized_keys'));

    expect(steps[newline]).toBe(String.raw`sed -i -e '$a\' ~/.ssh/authorized_keys`);
    expect(newline).toBeLessThan(append);
  });

  it('quotes the key, so its spaces reach the file as one line', () => {
    expect(authorizeKeyCommand(PUBLIC_KEY)).toContain(`'${PUBLIC_KEY}'`);
  });

  it('keeps the folder and the file private, as sshd requires', () => {
    const command = authorizeKeyCommand(PUBLIC_KEY);

    expect(command).toContain('install -d -m 700 ~/.ssh');
    expect(command).toContain('chmod 600 ~/.ssh/authorized_keys');
  });
});
