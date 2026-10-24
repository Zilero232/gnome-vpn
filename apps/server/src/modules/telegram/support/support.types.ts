import type { Context, NextFunction } from 'grammy';
import type { Message, User } from 'grammy/types';

import type { BotLocale, ResolvedChat } from '../telegram.types';

export type SupportAnswerInput = {
  ctx: Context;
  next: NextFunction;
};

export type SupportThreadInput = {
  ctx: Context;
  sender: User;
  adminChatId: number;
  chat: ResolvedChat | null;
};

export type SupportDeliverInput = {
  ctx: Context;
  message: Message;
  telegramId: bigint;
  locale: BotLocale;
};

export type RememberThreadInput = {
  adminChatId: number;
  messageId: number;
  telegramId: number;
  locale: BotLocale;
};
