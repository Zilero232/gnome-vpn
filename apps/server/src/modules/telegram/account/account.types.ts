import type { Context } from 'grammy';

import type { PrismaExecutor } from '@/core';
import type { PeerRef } from '@/modules/peers';

import type { EnsuredChat, ResolvedChat } from '../telegram.types';

export type ConsumeLinkCodeInput = {
  code: string;
  telegramId: bigint;
  username: string | null;
  languageCode: string | null;
};

export type LinkedAccount = {
  userId: string;
  telegramId: bigint;
  username: string | null;
};

export type MergeOutcome = {
  account: LinkedAccount;
  released: PeerRef[];
};

export type UntouchedUserInput = {
  tx: PrismaExecutor;
  userId: string;
};

export type ConsumeInput = {
  ctx: Context;
  text: string;
};

export type WelcomeInput = {
  ctx: Context;
  note?: string;
};

export type GreetInput = {
  ctx: Context;
  chat: EnsuredChat;
  note?: string;
};

export type ArriveInput = {
  ctx: Context;
  code: string | null;
};

export type AttributeNoteInput = {
  chat: ResolvedChat;
  code: string | null;
};

export type WidgetPayload = Record<string, string>;

export type VerifyWidgetInput = {
  payload: WidgetPayload;
  botToken: string;
  now?: Date;
};

export type IsFreshInput = {
  authDate: string;
  now: Date;
};
