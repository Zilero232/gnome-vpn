'use client';

import { useTranslations } from 'next-intl';

import { QueryBlock } from '@/entities/admin/records';
import { SectionHead } from '@/ui-kit';

import { useAdminOverview } from '../model/hooks';
import { AnalyticsSection, DeviceShares, KpiGrid } from './components';

import s from './OverviewPanel.module.scss';

export const OverviewPanel = () => {
  const t = useTranslations('admin.overview');

  const { data: overview, isPending, isRefetching, refetch } = useAdminOverview();

  return (
    <div className={s.root}>
      <SectionHead description={t('description')} title={t('title')} />

      <QueryBlock data={overview} isPending={isPending} isRetrying={isRefetching} onRetry={() => void refetch()}>
        {(loaded) => (
          <>
            <KpiGrid overview={loaded} />

            <DeviceShares devicesBy={loaded.devicesBy} />
          </>
        )}
      </QueryBlock>

      <AnalyticsSection />
    </div>
  );
};
