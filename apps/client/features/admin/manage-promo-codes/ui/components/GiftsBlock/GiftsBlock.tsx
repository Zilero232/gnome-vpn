'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { QueryBlock, usePageLabels } from '@/entities/admin/records';
import { DataTable, Pagination, SectionHead, Text } from '@/ui-kit';

import { useAdminGifts } from '../../../model/hooks';
import { useGiftColumns } from './use-gift-columns';

import s from './GiftsBlock.module.scss';

export const GiftsBlock = () => {
  const t = useTranslations('admin.promo.gifts');
  const pageLabels = usePageLabels();
  const columns = useGiftColumns();

  const [page, setPage] = useState(1);

  const { data: result, isPending, isPlaceholderData, isRefetching, refetch } = useAdminGifts(page);

  return (
    <section className={s.root}>
      <SectionHead description={t('description')} level='h3' title={t('title')} />

      <QueryBlock data={result} isPending={isPending} isRetrying={isRefetching} onRetry={() => void refetch()}>
        {({ items, page: info }) => (
          <>
            <DataTable
              empty={
                <Text size='sm' tone='muted'>
                  {t('empty')}
                </Text>
              }
              caption={t('title')}
              columns={columns}
              isFaded={isPlaceholderData}
              rowKey={(gift) => gift.id}
              rows={items}
            />

            <Pagination isDisabled={isPlaceholderData} labels={pageLabels(info)} page={info.page} pages={info.pages} onChange={setPage} />
          </>
        )}
      </QueryBlock>
    </section>
  );
};
