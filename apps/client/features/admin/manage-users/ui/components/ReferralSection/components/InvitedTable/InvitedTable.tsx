'use client';

import type { AdminReferral } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';

import type { DataColumn } from '@/ui-kit';

import { UserLink } from '@/entities/admin/navigation';
import { useAdminFormat } from '@/entities/admin/records';
import { DataTable, Text } from '@/ui-kit';

import type { InvitedTableProps } from './InvitedTable.types';

export const InvitedTable = ({ invited, total }: InvitedTableProps) => {
  const t = useTranslations('admin.user.referral');
  const format = useAdminFormat();

  const columns: DataColumn<AdminReferral>[] = [
    { key: 'user', header: t('columns.user'), isPrimary: true, cell: ({ user }) => <UserLink user={user} /> },
    { key: 'since', header: t('columns.since'), cell: ({ createdAt }) => format.date(createdAt) },
    { key: 'rewarded', header: t('columns.rewarded'), cell: ({ rewardedAt }) => (rewardedAt ? format.date(rewardedAt) : t('notRewarded')) },
    { key: 'days', header: t('columns.days'), align: 'end', cell: ({ days }) => format.count(days) }
  ];

  return (
    <>
      <DataTable caption={t('invitedCaption')} columns={columns} rowKey={(row) => row.user.id} rows={invited} />

      {total > invited.length && (
        <Text size='xs' tone='muted'>
          {t('more', { shown: invited.length, total })}
        </Text>
      )}
    </>
  );
};
