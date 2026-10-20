import { NodeSSH } from 'node-ssh';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pRetry, { AbortError } from 'p-retry';

import type { SshCommand, SshConnectOptions, SshExecResult, SshPutFileInput } from './ssh.types';

import { SIGNALLED_EXIT_CODE, SSH_CONNECT, SSH_UPLOAD } from './ssh.constants';
import { failureOf, isAuthFailure } from './ssh.helpers';

export class SshClient {
  private readonly ssh = new NodeSSH();

  async connect(opts: SshConnectOptions) {
    const attempt = async () => {
      try {
        await this.ssh.connect({
          host: opts.host,
          username: opts.username,
          ...(opts.port && { port: opts.port }),
          ...(opts.privateKeyPath ? { privateKeyPath: opts.privateKeyPath } : { password: opts.password }),
          readyTimeout: SSH_CONNECT.readyTimeoutMs
        });
      } catch (error) {
        if (isAuthFailure(error)) {
          throw new AbortError(error);
        }

        throw error;
      }
    };

    await pRetry(attempt, { retries: SSH_CONNECT.retries, minTimeout: SSH_CONNECT.minBackoffMs });
  }

  async exec(input: SshCommand): Promise<SshExecResult> {
    const { command, stdin } = typeof input === 'string' ? { command: input, stdin: undefined } : input;
    const result = await this.ssh.execCommand(command, { stdin });

    return { stdout: result.stdout, stderr: result.stderr, exitCode: result.code ?? SIGNALLED_EXIT_CODE };
  }

  async run(input: SshCommand): Promise<SshExecResult> {
    const result = await this.exec(input);

    if (result.exitCode !== 0) {
      throw new Error(failureOf(result));
    }

    return result;
  }

  async putFile({ content, remotePath }: SshPutFileInput) {
    const dir = await mkdtemp(join(tmpdir(), SSH_UPLOAD.tempPrefix));
    const localPath = join(dir, SSH_UPLOAD.payloadName);

    try {
      await writeFile(localPath, content, 'utf8');
      await this.ssh.putFile(localPath, remotePath);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }

  dispose(): void {
    this.ssh.dispose();
  }
}
