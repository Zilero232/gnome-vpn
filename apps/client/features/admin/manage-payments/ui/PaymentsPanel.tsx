'use client';

import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { QueryBlock, useCsvExport, usePageLabels } from '@/entities/admin/records';
import { useToastError } from '@/entities/app/locale';
import { exportAdminPayments } from '@/shared/api';
import { Pagination, SectionHead, SubmitButton } from '@/ui-kit';

import type { PaymentFilterState } from '../lib';

import { PAYMENT_FILTER } from '../config';
import { paymentFilterQuery } from '../lib';
import { useAdminPayments } from '../model/hooks';
import { PaymentFilters, PaymentRows, PaymentTotals } from './components';

import s from './PaymentsPanel.module.scss';

export const PaymentsPanel = () => {
  const t = useTranslations('admin.payments');
  const toastError = useToastError();
  const pageLabels = usePageLabels();

  const [filter, setFilter] = useState<PaymentFilterState>(PAYMENT_FILTER.initial);
  const [page, setPage] = useState(1);

  const { data: result, isPending, isPlaceholderData, isRefetching, refetch } = useAdminPayments({ ...paymentFilterQuery(filter), page });
  const exportCsv = useCsvExport({ request: exportAdminPayments, onError: toastError });

  const onFilter = (next: PaymentFilterState) => {
    setFilter(next);
    setPage(1);
  };

  return (
    <div className={s.root}>
      <SectionHead
        actions={
          <SubmitButton
            isPending={exportCsv.isPending}
            size='md'
            type='button'
            variant='ghost'
            onClick={() => exportCsv.mutate(paymentFilterQuery(filter))}
          >
            <Download aria-hidden size={16} />
            {t('export')}
          </SubmitButton>
        }
        description={t('description')}
        title={t('title')}
      />

      <PaymentFilters value={filter} onChange={onFilter} />

      <QueryBlock data={result} isPending={isPending} isRetrying={isRefetching} onRetry={() => void refetch()}>
        {({ items, page: info, totals }) => (
          <>
            {totals.count > 0 && <PaymentTotals totals={totals} />}

            <PaymentRows caption={t('caption')} isFaded={isPlaceholderData} payments={items} />

            <Pagination isDisabled={isPlaceholderData} labels={pageLabels(info)} page={info.page} pages={info.pages} onChange={setPage} />
          </>
        )}
      </QueryBlock>
    </div>
  );
};
