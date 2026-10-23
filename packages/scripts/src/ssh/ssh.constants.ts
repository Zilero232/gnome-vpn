export const SSH_CONNECT = {
  readyTimeoutMs: 60_000,
  retries: 3,
  minBackoffMs: 3_000,
  authFailureLevel: 'client-authentication'
} as const;

export const SIGNALLED_EXIT_CODE = 128;
