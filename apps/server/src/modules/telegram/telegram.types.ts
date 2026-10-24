import type { PlanId } from '@gnomevpn/schemas';
import type { Context, InlineKeyboard } from 'grammy';

import type { BOT_LOCALES } from './config';
import type { NOTICES } from './notify/notify.config';
import type { TextFill } from './shared/text';

export type BotLocale = (typeof BOT_LOCALES)[number];

export type BotMessages = typeof import('./config/locales/ru.json');

export type BotText = BotMessages['text'];

export type BotButtons = BotMessages['buttons'];

export type BotPlatforms = BotMessages['platforms'];

export type BotProfile = BotMessages['profile'];

export type BotCommand = {
  command: string;
  description: string;
};

export type ButtonKey = keyof BotButtons;

export type BotMessage = {
  text: string;
  markup?: InlineKeyboard;
};

export type BotHandler = (ctx: Context) => Promise<void>;

export type TelegramIdentity = {
  telegramId: bigint;
  username: string | null;
  languageCode: string | null;
};

export type ResolvedChat = {
  userId: string;
  telegramId: bigint;
  locale: BotLocale;
};

export type EnsuredChat = ResolvedChat & {
  isNew: boolean;
};

export type NoticeSpec = {
  markup: 'main' | readonly ButtonKey[];
  effect?: string;
  refreshHint?: boolean;
  isPromotional?: boolean;
};

export type NoticeKey = keyof typeof NOTICES & keyof BotText;

export type NotifyInput = {
  userId: string;
  notice: NoticeKey;
  fill?: TextFill;
  date?: Date | null;
  days?: number;
  invite?: PlanId;
};
