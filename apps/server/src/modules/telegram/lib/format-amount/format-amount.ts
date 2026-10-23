import type { FormatAmountInput } from './format-amount.types';

import { AMOUNT_FORMAT } from './format-amount.constants';

export const formatAmount = ({ amount, locale }: FormatAmountInput): string => new Intl.NumberFormat(locale, AMOUNT_FORMAT).format(amount);
