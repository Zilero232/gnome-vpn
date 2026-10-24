import type { BotLocale } from '@/modules/telegram/telegram.types';

export type LabelledNode = {
  country: string;
  countryCode: string;
  city: string | null;
};

export type NodeLabelInput = {
  node: LabelledNode;
  locale: BotLocale;
};
