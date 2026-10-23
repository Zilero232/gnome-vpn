'use client';

import type { AdminRedemption } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';

import type { DataColumn } from '@/ui-kit';

import { useAdminFormat } from '@/entities/admin/records';
import { DataTable } from '@/ui-kit';

import type { RedemptionTableProps } from './RedemptionTable.types';

import { redemptionState } from '../../../../../lib';

export const RedemptionTable = ({ redemptions }: RedemptionTableProps) => {
  const t = useTranslations('admin.user.promo');
  const format = useAdminFormat();

  const columns: DataColumn<AdminRedemption>[] = [
    { key: 'code', header: t('columns.code'), isPrimary: true, cell: ({ code }) => <code>{code}</code> },
    {
      key: 'effect',
      header: t('columns.effect'),
      cell: ({ kind, percent, days }) => t(`effect.${kind}`, { percent: percent ?? 0, days: days ?? 0 })
    },
    { key: 'date', header: t('columns.date'), cell: ({ createdAt }) => format.date(createdAt) },
    { key: 'state', header: t('columns.state'), cell: (redemption) => t(`states.${redemptionState(redemption)}`) }
  ];

  return <DataTable caption={t('redemptions')} columns={columns} rowKey={(row) => `${row.code}-${row.createdAt}`} rows={redemptions} />;
};
