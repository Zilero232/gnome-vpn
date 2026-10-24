import { isTruthy } from 'remeda';

import type { DescribeCardInput, YooKassaAmount } from './yookassa.types';

import { YOOKASSA_API } from './yookassa.constants';

export const describeCard = ({ card, title }: DescribeCardInput): string | null => {
  if (!card?.last4) {
    return title ?? null;
  }

  return [card.card_type, `•••• ${card.last4}`].filter(isTruthy).join(' ');
};

export const toAmount = (rub: number): YooKassaAmount => ({ value: rub.toFixed(2), currency: YOOKASSA_API.currency });
