import type { Bot, CommandContext, Context, FilterQuery } from 'grammy';

import type { CALLBACK_PREFIX } from '../config';
import type { BotLocale, ButtonKey } from '../telegram.types';
import type { OWNER_ROUTES, READER_ROUTES } from './bot.config';

export type BotAction<Route extends string = string> = { route: Route } & (
  { command: string; button?: ButtonKey } | { command?: string; button: ButtonKey }
);

export type CallbackKey = keyof typeof CALLBACK_PREFIX;

export type ReaderRoutes = {
  actions: readonly BotAction[];
  callbacks: readonly CallbackKey[];
  supportMedia: readonly FilterQuery[];
  commandPrefix: string;
};

export type OwnerRoutes = {
  commands: readonly string[];
  callbacks: readonly CallbackKey[];
};

export type ActionRoute = (typeof READER_ROUTES.actions)[number]['route'];

export type ReaderCallback = (typeof READER_ROUTES.callbacks)[number];

export type OwnerCommand = (typeof OWNER_ROUTES.commands)[number];

export type OwnerCallback = (typeof OWNER_ROUTES.callbacks)[number];

export type CommandHandler = (ctx: CommandContext<Context>) => Promise<void>;

export type DescribeInput = {
  bot: Bot;
  locale: BotLocale;
  isFallback?: boolean;
};
