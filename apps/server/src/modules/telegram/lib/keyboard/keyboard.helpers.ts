import { entries } from 'remeda';

import { BOT_BUTTONS, BOT_LOCALES, LEGACY_BUTTONS } from '@/modules/telegram/config';

import type { ButtonKey } from './keyboard.types';

const BY_LABEL = new Map<string, ButtonKey>(
  BOT_LOCALES.flatMap((locale) => entries(BOT_BUTTONS[locale]).map(([key, label]): [string, ButtonKey] => [label, key]))
);

export const buttonFor = (text: string): ButtonKey | null => BY_LABEL.get(text.trim()) ?? LEGACY_BUTTONS[text.trim()] ?? null;
