import type { DayCountInput } from './day-count.types';

import { pluralize } from '../../../../common/lib';
import { BOT_TEXT } from '../../config';

export const dayCount = ({ days, locale }: DayCountInput): string => {
  const text = BOT_TEXT[locale];

  return `${days} ${pluralize({ count: days, forms: { one: text.dayOne, few: text.dayFew, many: text.dayMany }, locale })}`;
};
