import type { BotLocale } from '@/modules/telegram/telegram.types';

export type FormatAmountInput = {
  amount: number;
  locale: BotLocale;
};
