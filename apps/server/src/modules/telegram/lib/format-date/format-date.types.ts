import type { BotLocale } from '@/modules/telegram/telegram.types';

export type FormatDateInput = {
  iso: string | null;
  locale: BotLocale;
};

export type FormatAgoInput = {
  date: Date;
  now: Date;
  locale: BotLocale;
};
