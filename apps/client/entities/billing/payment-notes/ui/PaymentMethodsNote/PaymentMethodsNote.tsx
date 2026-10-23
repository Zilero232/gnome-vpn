'use client';

import { useFormatter, useTranslations } from 'next-intl';

import { Text } from '@/ui-kit';

import type { PaymentMethodsNoteProps } from './PaymentMethodsNote.types';

import { usePaymentMethods } from '../../model/hooks';

export const PaymentMethodsNote = ({ className }: PaymentMethodsNoteProps) => {
  const t = useTranslations('payments');
  const format = useFormatter();
  const { data: paymentMethods } = usePaymentMethods();

  if (!paymentMethods || paymentMethods.methods.length === 0) {
    return null;
  }

  const names = paymentMethods.methods.map((method) => t(`method.${method}`));

  return (
    <Text className={className} size='xs' tone='muted'>
      {t('accepted', { count: names.length, list: format.list(names, { type: 'conjunction' }) })}
    </Text>
  );
};
