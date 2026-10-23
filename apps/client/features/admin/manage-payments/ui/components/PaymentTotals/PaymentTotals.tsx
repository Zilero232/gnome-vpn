'use client';

import { useTranslations } from 'next-intl';

import { useAdminFormat } from '@/entities/admin/records';
import { StatTile } from '@/ui-kit';

import type { PaymentTotalsProps } from './PaymentTotals.types';

import s from './PaymentTotals.module.scss';

export const PaymentTotals = ({ totals }: PaymentTotalsProps) => {
  const t = useTranslations('admin.payments.totals');
  const format = useAdminFormat();

  return (
    <div className={s.root}>
      <StatTile label={t('count')} value={format.count(totals.count)} />
      <StatTile hint={t('paidHint')} label={t('paid')} value={format.money(totals.paid)} />
      <StatTile hint={t('refundedHint')} label={t('refunded')} value={format.money(totals.refunded)} />
    </div>
  );
};
