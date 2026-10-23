'use client';

import { useTranslations } from 'next-intl';

import { DataTable, Text } from '@/ui-kit';

import type { UsersTableProps } from './UsersTable.types';

import { useUserColumns } from './use-user-columns';

export const UsersTable = ({ users, isFaded }: UsersTableProps) => {
  const t = useTranslations('admin.users');
  const columns = useUserColumns();

  return (
    <DataTable
      empty={
        <Text size='sm' tone='muted'>
          {t('empty')}
        </Text>
      }
      caption={t('caption')}
      columns={columns}
      isFaded={isFaded}
      rowKey={(user) => user.id}
      rows={users}
    />
  );
};
