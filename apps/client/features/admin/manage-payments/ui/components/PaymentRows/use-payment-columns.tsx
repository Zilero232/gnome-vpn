'use client';

import type { AdminPayment } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';

import type { DataColumn } from '@/ui-kit';

import { UserLink } from '@/entities/admin/navigation';
import { isRefundable, PaymentBadge, useAdminFormat } from '@/entities/admin/records';
import { Button, Text } from '@/ui-kit';

import type { UsePaymentColumnsInput } from './PaymentRows.types';

import { PaymentAmount } from '../PaymentAmount';

export const usePaymentColumns = ({ withUser, onRefund }: UsePaymentColumnsInput): DataColumn<AdminPayment>[] => {
  const t = useTranslations('admin.payments');
  const plans = useTranslations('plans.plans');
  const format = useAdminFormat();

  const userColumn: DataColumn<AdminPayment> = {
    key: 'user',
    header: t('columns.user'),
    cell: ({ user }) =>
      user ? (
        <UserLink user={user} />
      ) : (
        <Text size='sm' tone='muted'>
          {t('deletedUser')}
        </Text>
      )
  };

  return [
    { key: 'date', header: t('columns.date'), isPrimary: true, cell: ({ createdAt }) => format.dateTime(createdAt) },
    ...(withUser ? [userColumn] : []),
    { key: 'amount', header: t('columns.amount'), align: 'end', cell: (payment) => <PaymentAmount payment={payment} /> },
    {
      key: 'what',
      header: t('columns.what'),
      cell: ({ kind, plan, extraDevices, isAutoCharge }) => t(`kinds.${kind}`, { plan: plans(plan), count: extraDevices, auto: String(isAutoCharge) })
    },
    { key: 'status', header: t('columns.status'), cell: (payment) => <PaymentBadge payment={payment} /> },
    {
      key: 'action',
      header: t('columns.action'),
      align: 'end',
      cell: (payment) =>
        isRefundable(payment) ? (
          <Button size='sm' variant='ghost' onClick={() => onRefund(payment)}>
            {t('refund.action')}
          </Button>
        ) : (
          '—'
        )
    }
  ];
};
