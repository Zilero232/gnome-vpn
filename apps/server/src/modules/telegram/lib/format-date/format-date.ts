import { format, formatDistanceStrict } from 'date-fns';
import { isNullish } from 'remeda';

import type { FormatAgoInput, FormatDateInput } from './format-date.types';

import { DATE_FORMAT, DATE_LOCALES } from './format-date.constants';

export const formatDate = ({ iso, locale }: FormatDateInput) => {
  if (isNullish(iso)) {
    return '';
  }

  return format(new Date(iso), DATE_FORMAT, { locale: DATE_LOCALES[locale] });
};

export const formatAgo = ({ date, now, locale }: FormatAgoInput): string =>
  formatDistanceStrict(date, now, { addSuffix: true, locale: DATE_LOCALES[locale] });
