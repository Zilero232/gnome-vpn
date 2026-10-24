import type { Context } from 'grammy';

import type { BotLocale, BotMessage, BotText, ResolvedChat } from '../telegram.types';
import type { ConfirmCopyPick } from './keyboard';

export type ReplyInput = BotMessage & {
  ctx: Context;
  chat: ResolvedChat | null;
  effect?: string;
};

export type SiteUrlInput = {
  path: string;
  locale: BotLocale;
};

export type EditInput = BotMessage & {
  ctx: Context;
};

export type WithUserInput = {
  ctx: Context;
  act: (chat: ResolvedChat) => Promise<unknown>;
};

export type AttemptInput = {
  ctx: Context;
  chat: ResolvedChat;
  act: () => Promise<unknown>;
};

export type Answer = {
  chat: ResolvedChat;
  value: string;
};

export type AnsweredInput = {
  ctx: Context;
  prefix: string;
  act: (answer: Answer) => Promise<unknown>;
};

export type AskInput = {
  ctx: Context;
  prefix: string;
  pick: ConfirmCopyPick;
};

export type ConfirmedInput = {
  ctx: Context;
  prefix: string;
  cancelled: (copy: BotText) => string;
  act: (chat: ResolvedChat) => Promise<unknown>;
};

export type ChatCopy = {
  chat: ResolvedChat | null;
  copy: BotText;
};

export type AcknowledgeInput = {
  ctx: Context;
  text?: string;
};
