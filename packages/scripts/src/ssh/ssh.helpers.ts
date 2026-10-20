import type { SshExecResult } from './ssh.types';

import { SSH_CONNECT } from './ssh.constants';

export const failureOf = ({ stdout, stderr, exitCode }: SshExecResult): string => {
  const output = stderr.trim() || stdout.trim() || 'no output';

  return `the remote command exited with ${exitCode}: ${output}`;
};

export const isAuthFailure = (error: unknown): error is Error =>
  error instanceof Error && 'level' in error && error.level === SSH_CONNECT.authFailureLevel;
