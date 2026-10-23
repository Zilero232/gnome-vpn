'use client';

import type { AdminCampaign } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { QueryBlock, usePageLabels } from '@/entities/admin/records';
import { DataTable, Pagination, SectionHead, Text } from '@/ui-kit';

import { useAdminCampaigns, useStopCampaign } from '../../../model/hooks';
import { CampaignChart } from '../CampaignChart';
import { StopDialog } from '../StopDialog';
import { useCampaignColumns } from './use-campaign-columns';

import s from './CampaignsBlock.module.scss';

export const CampaignsBlock = () => {
  const t = useTranslations('admin.promo.campaigns');
  const pageLabels = usePageLabels();
  const stop = useStopCampaign();

  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<AdminCampaign | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { data: result, isPending, isPlaceholderData, isRefetching, refetch } = useAdminCampaigns(page);

  const columns = useCampaignColumns({
    onStop: (campaign) => {
      setTarget(campaign);
      setIsConfirmOpen(true);
    }
  });

  const onConfirm = () => {
    if (!target) {
      return;
    }

    stop.mutate(target.code, {
      onSuccess: () => {
        setIsConfirmOpen(false);
        toast.success(t('stop.done', { code: target.code }));
      }
    });
  };

  return (
    <section className={s.root}>
      <SectionHead description={t('description')} level='h3' title={t('title')} />

      <QueryBlock data={result} isPending={isPending} isRetrying={isRefetching} onRetry={() => void refetch()}>
        {({ items, page: info }) => (
          <>
            <CampaignChart campaigns={items} isFaded={isPlaceholderData} />

            <DataTable
              empty={
                <Text size='sm' tone='muted'>
                  {t('empty')}
                </Text>
              }
              caption={t('title')}
              columns={columns}
              isFaded={isPlaceholderData}
              rowKey={(campaign) => campaign.id}
              rows={items}
            />

            <Pagination isDisabled={isPlaceholderData} labels={pageLabels(info)} page={info.page} pages={info.pages} onChange={setPage} />
          </>
        )}
      </QueryBlock>

      <StopDialog code={target?.code ?? ''} isOpen={isConfirmOpen} isPending={stop.isPending} onConfirm={onConfirm} onOpenChange={setIsConfirmOpen} />
    </section>
  );
};
