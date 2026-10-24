export type IsAdminChatInput = {
  chatId: number | undefined;
  adminChatId: number | null;
};

export type BotBlockChange = 'blocked' | 'unblocked';

export type DeliveryOutcome = { kind: 'blocked' } | { kind: 'failed' } | { kind: 'flood'; retryAfterSeconds: number } | { kind: 'missing' };
