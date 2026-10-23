import { NodeSSH } from 'node-ssh';
import pRetry, { AbortError } from 'p-retry';

import type { SshCommand, SshConnectOptions, SshExecResult, SshPutFileInput } from './ssh.types';

import { arg, line } from '../shell';
import { SIGNALLED_EXIT_CODE, SSH_CONNECT } from './ssh.constants';
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
    await this.run({ command: line(['cat', '>', arg(remotePath)]), stdin: content });
  }

  dispose(): void {
    this.ssh.dispose();
  }
}
