import type { AdminTelegram } from '@gnomevpn/schemas';

export const telegramHandle = ({ id, username }: AdminTelegram): string => (username ? `@${username}` : id);
