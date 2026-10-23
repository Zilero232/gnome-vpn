import type { BotLocale } from '../../telegram.types';

export type LabelledNode = {
  country: string;
  countryCode: string;
  city: string | null;
};

export type NodeLabelInput = {
  node: LabelledNode;
  locale: BotLocale;
};
