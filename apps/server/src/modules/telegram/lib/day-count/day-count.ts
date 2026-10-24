import { pluralize } from '@/common/lib';
import { BOT_TEXT } from '@/modules/telegram/config';

import type { DayCountInput } from './day-count.types';

export const dayCount = ({ days, locale }: DayCountInput): string => {
  const text = BOT_TEXT[locale];

  return `${days} ${pluralize({ count: days, forms: { one: text.dayOne, few: text.dayFew, many: text.dayMany }, locale })}`;
};
