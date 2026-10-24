import { enGB, ru } from 'date-fns/locale';

import type { BotLocale } from '@/modules/telegram/telegram.types';

export const HTML = {
  escapes: { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' },
  tags: ['b', 'i', 'u', 's', 'code', 'pre', 'a', 'blockquote', 'tg-spoiler'],
  tag: /<\/?([a-z-]+)(?:\s[^>]*)?>/g,
  entity: /&(amp|lt|gt|quot);/g,
  paragraphBreak: '\n\n'
} as const;

export const DATE_FORMAT = {
  pattern: 'd MMMM yyyy',
  locales: { ru, en: enGB } satisfies Record<BotLocale, typeof ru>
} as const;

export const AMOUNT_FORMAT = {
  maximumFractionDigits: 2
} as const;

export const LABEL = {
  russianPrefix: 'ru',
  citySeparator: ' · '
} as const;
