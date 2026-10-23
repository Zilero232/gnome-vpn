export const PUBLIC_IP = {
  url: 'https://api.ipify.org',
  params: { format: 'json' },
  timeoutMs: 5_000
} as const;
