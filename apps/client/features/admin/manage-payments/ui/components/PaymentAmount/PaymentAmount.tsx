'use client';

import { useTranslations } from 'next-intl';
import { isNonNullish } from 'remeda';

import { useAdminFormat } from '@/entities/admin/records';
import { Text } from '@/ui-kit';

import type { PaymentAmountProps } from './PaymentAmount.types';

import s from './PaymentAmount.module.scss';

export const PaymentAmount = ({ payment }: PaymentAmountProps) => {
  const t = useTranslations('admin.payments');
  const format = useAdminFormat();

  return (
    <span className={s.root}>
      <Text as='span' size='sm' weight='semibold'>
        {format.money(payment.amount)}
      </Text>

      {isNonNullish(payment.discountPercent) && (
        <Text as='span' size='xs' tone='muted'>
          {t('discount', { percent: payment.discountPercent, code: payment.promoCode ?? '—' })}
        </Text>
      )}
    </span>
  );
};
