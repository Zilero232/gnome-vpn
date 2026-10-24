import type { ChatMemberUpdated, User } from 'grammy/types';

import { GrammyError } from 'grammy';
import { isEmpty, isIncludedIn, isNonNullish, isNullish } from 'remeda';

import type { TelegramIdentity } from '@/modules/telegram/telegram.types';

import type { BotBlockChange, DeliveryOutcome, IsAdminChatInput } from './update.types';

import { BOT_URL_BASE, DELIVERY, MEMBER_STATUS } from './update.constants';

export const identityOf = (from: User | undefined): TelegramIdentity | null => {
  if (isNullish(from)) {
    return null;
  }

  return {
    telegramId: BigInt(from.id),
    username: from.username ?? null,
    languageCode: from.language_code ?? null
  };
};

export const adminChatOf = (raw: string): number | null => {
  const id = Number(raw);

  return isEmpty(raw) || !Number.isSafeInteger(id) ? null : id;
};

export const isAdminChat = ({ chatId, adminChatId }: IsAdminChatInput): boolean =>
  isNonNullish(chatId) && isNonNullish(adminChatId) && chatId === adminChatId;

export const migratedChatId = (error: unknown): number | null =>
  error instanceof GrammyError && isNonNullish(error.parameters.migrate_to_chat_id) ? error.parameters.migrate_to_chat_id : null;

export const botBlockChange = ({ chat, old_chat_member, new_chat_member }: ChatMemberUpdated): BotBlockChange | null => {
  if (chat.type !== 'private' || old_chat_member.status === new_chat_member.status) {
    return null;
  }

  if (new_chat_member.status === MEMBER_STATUS.botBlocked) {
    return 'blocked';
  }

  return new_chat_member.status === MEMBER_STATUS.botUnblocked ? 'unblocked' : null;
};

export const isGroupJoin = ({ chat, old_chat_member, new_chat_member }: ChatMemberUpdated): boolean =>
  chat.type !== 'private' &&
  isIncludedIn(old_chat_member.status, MEMBER_STATUS.outOfGroup) &&
  isIncludedIn(new_chat_member.status, MEMBER_STATUS.inGroup);

export const botUrl = (username: string | undefined): string | undefined => {
  const name = username?.trim().replace(/^@/u, '');

  return name === undefined || isEmpty(name) ? undefined : `${BOT_URL_BASE}${name}`;
};

export const deliveryOutcome = (error: unknown): DeliveryOutcome => {
  if (!(error instanceof GrammyError)) {
    return { kind: 'failed' };
  }

  if (error.error_code === DELIVERY.blockedCode) {
    return { kind: 'blocked' };
  }

  if (error.error_code === DELIVERY.floodCode) {
    return { kind: 'flood', retryAfterSeconds: error.parameters.retry_after ?? 1 };
  }

  return DELIVERY.sourceMissing.test(error.description) ? { kind: 'missing' } : { kind: 'failed' };
};
