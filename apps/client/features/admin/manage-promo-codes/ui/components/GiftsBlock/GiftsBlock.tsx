'use client';

import { useTranslations } from 'next-intl';

import { FilterSummary, QueryBlock, useListFilters, usePageLabels } from '@/entities/admin/records';
import { DataTable, Pagination, SectionHead, Text } from '@/ui-kit';

import { GIFT_FILTERS } from '../../../config';
import { useAdminGifts } from '../../../model/hooks';
import { GiftFilters } from '../GiftFilters';
import { useGiftColumns } from './use-gift-columns';

import s from './GiftsBlock.module.scss';

export const GiftsBlock = () => {
  const t = useTranslations('admin.promo.gifts');
  const pageLabels = usePageLabels();
  const columns = useGiftColumns();
  const list = useListFilters(GIFT_FILTERS);

  const { data: result, isPending, isPlaceholderData, isRefetching, refetch } = useAdminGifts({ ...list.query, page: list.page });

  return (
    <section className={s.root}>
      <SectionHead description={t('description')} level='h3' title={t('title')} />

      <GiftFilters value={list.filters} onChange={list.change} />

      <QueryBlock data={result} isPending={isPending} isRetrying={isRefetching} onRetry={() => void refetch()}>
        {({ items, page: info }) => (
          <>
            {list.isFiltered && <FilterSummary count={info.total} onReset={list.reset} />}

            <DataTable
              empty={
                <Text size='sm' tone='muted'>
                  {list.isFiltered ? t('filters.empty') : t('empty')}
                </Text>
              }
              caption={t('title')}
              columns={columns}
              isFaded={isPlaceholderData}
              rowKey={(gift) => gift.id}
              rows={items}
            />

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
    </section>
  );
};
