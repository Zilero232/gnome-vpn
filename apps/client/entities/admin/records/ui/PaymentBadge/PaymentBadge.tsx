'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/ui-kit';

import type { PaymentBadgeProps } from './PaymentBadge.types';

import { PAYMENT_TONE } from '../../config';
import { paymentState } from '../../lib';

export const PaymentBadge = ({ payment, className }: PaymentBadgeProps) => {
  const t = useTranslations('admin.records.payment');
  const state = paymentState(payment);

  return (
    <Badge className={className} tone={PAYMENT_TONE[state]}>
      {t(state)}
    </Badge>
  );
};
