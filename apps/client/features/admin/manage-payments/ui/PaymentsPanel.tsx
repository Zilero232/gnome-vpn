'use client';

import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FilterSummary, QueryBlock, useCsvExport, useListFilters, usePageLabels } from '@/entities/admin/records';
import { useToastError } from '@/entities/app/locale';
import { exportAdminPayments } from '@/shared/api';
import { Pagination, SectionHead, SubmitButton } from '@/ui-kit';

import { PAYMENT_FILTERS } from '../config';
import { useAdminPayments } from '../model/hooks';
import { PaymentFilters, PaymentRows, PaymentTotals } from './components';

import s from './PaymentsPanel.module.scss';

export const PaymentsPanel = () => {
  const t = useTranslations('admin.payments');
  const toastError = useToastError();
  const pageLabels = usePageLabels();
  const list = useListFilters(PAYMENT_FILTERS);

  const { data: result, isPending, isPlaceholderData, isRefetching, refetch } = useAdminPayments({ ...list.query, page: list.page });
  const exportCsv = useCsvExport({ request: exportAdminPayments, onError: toastError });

  return (
    <div className={s.root}>
      <SectionHead
        actions={
          <SubmitButton isPending={exportCsv.isPending} size='md' type='button' variant='ghost' onClick={() => exportCsv.mutate(list.query)}>
            <Download aria-hidden size={16} />
            {t('export')}
          </SubmitButton>
        }
        description={t('description')}
        title={t('title')}
      />

      <PaymentFilters value={list.filters} onChange={list.change} />

      <QueryBlock data={result} isPending={isPending} isRetrying={isRefetching} onRetry={() => void refetch()}>
        {({ items, page: info, totals }) => (
          <>
            {list.isFiltered && <FilterSummary count={info.total} onReset={list.reset} />}

            {totals.count > 0 && <PaymentTotals totals={totals} />}

            <PaymentRows caption={t('caption')} isFaded={isPlaceholderData} payments={items} />

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
