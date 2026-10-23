'use client';

import type { AdminGift } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';

import type { DataColumn } from '@/ui-kit';

import { UserLink } from '@/entities/admin/navigation';
import { useAdminFormat } from '@/entities/admin/records';
import { Badge, DataTable } from '@/ui-kit';

import type { BoughtGiftsProps } from './BoughtGifts.types';

export const BoughtGifts = ({ gifts }: BoughtGiftsProps) => {
  const t = useTranslations('admin.user.promo');
  const plans = useTranslations('plans.plans');
  const format = useAdminFormat();

  const columns: DataColumn<AdminGift>[] = [
    { key: 'code', header: t('columns.code'), isPrimary: true, cell: ({ code }) => <code>{code}</code> },
    { key: 'plan', header: t('columns.plan'), cell: ({ plan }) => (plan ? plans(plan) : '—') },
    { key: 'date', header: t('columns.bought'), cell: ({ createdAt }) => format.date(createdAt) },
    {
      key: 'redeemed',
      header: t('columns.redeemed'),
      cell: ({ redeemedAt, redeemedBy, isRevoked }) => {
        if (isRevoked) {
          return <Badge tone='danger'>{t('revoked')}</Badge>;
        }

        return redeemedBy && redeemedAt ? <UserLink user={redeemedBy} /> : t('notRedeemed');
      }
    }
  ];

  return <DataTable caption={t('gifts')} columns={columns} rowKey={(gift) => gift.id} rows={gifts} />;
};
