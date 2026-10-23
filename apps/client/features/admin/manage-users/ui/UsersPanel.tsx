'use client';

import { useDebounceValue } from '@siberiacancode/reactuse';
import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FilterSummary, QueryBlock, useCsvExport, useListFilters, usePageLabels } from '@/entities/admin/records';
import { useToastError } from '@/entities/app/locale';
import { exportAdminUsers } from '@/shared/api';
import { Pagination, SectionHead, SubmitButton } from '@/ui-kit';

import { USER_FILTERS, USER_SEARCH } from '../config';
import { useAdminUsers } from '../model/hooks';
import { UserFilters, UserSearch, UsersTable } from './components';

import s from './UsersPanel.module.scss';

export const UsersPanel = () => {
  const t = useTranslations('admin.users');
  const toastError = useToastError();
  const pageLabels = usePageLabels();
  const list = useListFilters(USER_FILTERS);
  const searched = useDebounceValue(list.filters.query.trim(), USER_SEARCH.debounceMs);

  const request = { ...list.query, query: searched };

  const { data: result, isPending, isPlaceholderData, isFetching, isRefetching, refetch } = useAdminUsers({ ...request, page: list.page });
  const exportCsv = useCsvExport({ request: exportAdminUsers, onError: toastError });

  return (
    <div className={s.root}>
      <SectionHead
        actions={
          <SubmitButton isPending={exportCsv.isPending} size='md' type='button' variant='ghost' onClick={() => exportCsv.mutate(request)}>
            <Download aria-hidden size={16} />
            {t('export')}
          </SubmitButton>
        }
        description={t('description')}
        title={t('title')}
      />

      <UserSearch isSearching={isFetching && isPlaceholderData} value={list.filters.query} onChange={(query) => list.change({ query })} />

      <UserFilters value={list.filters} onChange={list.change} />

      <QueryBlock data={result} isPending={isPending} isRetrying={isRefetching} onRetry={() => void refetch()}>
        {({ items, page: info }) => (
          <>
            {list.isFiltered && <FilterSummary count={info.total} onReset={list.reset} />}

            <UsersTable isFaded={isPlaceholderData} isFiltered={list.isFiltered} users={items} />

            <Pagination
              isDisabled={isPlaceholderData}
              labels={pageLabels(info)}
              page={info.page}
              pages={info.pages}
              onChange={(page) => void list.setPage(page)}
            />
          </>
        )}
      </QueryBlock>
    </div>
  );
};
