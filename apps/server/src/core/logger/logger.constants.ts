import type { CreateLoggerInput } from '@gnomevpn/logger';

export const APP_LOGGER = {
  service: 'gnomevpn-server',
  pretty: {
    ignore: 'context',
    messageFormat: '[{context}] {msg}'
  }
} as const satisfies CreateLoggerInput;
