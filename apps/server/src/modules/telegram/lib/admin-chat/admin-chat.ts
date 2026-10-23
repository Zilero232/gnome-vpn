import { GrammyError } from 'grammy';
import { isEmpty, isNonNullish } from 'remeda';

import type { IsAdminChatInput } from './admin-chat.types';

export const adminChatOf = (raw: string): number | null => {
  const id = Number(raw);

  return isEmpty(raw) || !Number.isSafeInteger(id) ? null : id;
};

export const isAdminChat = ({ chatId, adminChatId }: IsAdminChatInput): boolean =>
  isNonNullish(chatId) && isNonNullish(adminChatId) && chatId === adminChatId;

export const migratedChatId = (error: unknown): number | null =>
  error instanceof GrammyError && isNonNullish(error.parameters.migrate_to_chat_id) ? error.parameters.migrate_to_chat_id : null;
