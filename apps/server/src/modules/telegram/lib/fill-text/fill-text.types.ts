import type { TEXT_TOKEN } from '@/modules/telegram/config';

export type TextFill = Partial<Record<keyof typeof TEXT_TOKEN, string>>;

export type FillTextInput = {
  text: string;
  fill: TextFill;
};
