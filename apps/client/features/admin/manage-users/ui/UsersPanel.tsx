'use client';

import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { QueryBlock, useCsvExport, usePageLabels } from '@/entities/admin/records';
import { useToastError } from '@/entities/app/locale';
import { exportAdminUsers } from '@/shared/api';
import { Pagination, SectionHead, SubmitButton } from '@/ui-kit';

import { useAdminUsers } from '../model/hooks';
import { UserSearch, UsersTable } from './components';

import s from './UsersPanel.module.scss';

export const UsersPanel = () => {
  const t = useTranslations('admin.users');
  const toastError = useToastError();
  const pageLabels = usePageLabels();

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data: result, isPending, isPlaceholderData, isFetching, isRefetching, refetch } = useAdminUsers({ query, page });
  const exportCsv = useCsvExport({ request: exportAdminUsers, onError: toastError });

  const onSearch = (next: string) => {
    setQuery(next);
    setPage(1);
  };

  return (
    <div className={s.root}>
      <SectionHead
        actions={
          <SubmitButton isPending={exportCsv.isPending} size='md' type='button' variant='ghost' onClick={() => exportCsv.mutate({ query })}>
            <Download aria-hidden size={16} />
            {t('export')}
          </SubmitButton>
        }
        description={t('description')}
        title={t('title')}
      />

      <UserSearch isSearching={isFetching && isPlaceholderData} onSearch={onSearch} />

      <QueryBlock data={result} isPending={isPending} isRetrying={isRefetching} onRetry={() => void refetch()}>
        {({ items, page: info }) => (
          <>
            <UsersTable isFaded={isPlaceholderData} users={items} />

            <Pagination isDisabled={isPlaceholderData} labels={pageLabels(info)} page={info.page} pages={info.pages} onChange={setPage} />
          </>
        )}
      </QueryBlock>
    </div>
  );
};
