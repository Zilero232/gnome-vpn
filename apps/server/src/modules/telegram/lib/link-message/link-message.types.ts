import type { BotLocale } from '@/modules/telegram/telegram.types';

export type LinkMessageInput = {
  locale: BotLocale;
  intro: string;
  url: string;
};
