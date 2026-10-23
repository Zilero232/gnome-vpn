'use client';

import type { AdminAnalyticsRange } from '@gnomevpn/schemas';

import { ADMIN_ANALYTICS, ADMIN_ANALYTICS_RANGES } from '@gnomevpn/schemas';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { QueryBlock } from '@/entities/admin/records';
import { SectionHead, Segmented } from '@/ui-kit';

import { useAdminAnalytics } from '../../../model/hooks';
import { AnalyticsCharts } from '../AnalyticsCharts';

import s from './AnalyticsSection.module.scss';

export const AnalyticsSection = () => {
  const t = useTranslations('admin.analytics');

  const [range, setRange] = useState<AdminAnalyticsRange>(ADMIN_ANALYTICS.defaultRange);

  const { data: analytics, isPending, isPlaceholderData, isRefetching, refetch } = useAdminAnalytics(range);

  return (
    <section className={s.root}>
      <SectionHead
        actions={
          <Segmented<AdminAnalyticsRange>
            aria-label={t('range.label')}
            options={ADMIN_ANALYTICS_RANGES.map((value) => ({ value, label: t(`range.${value}`) }))}
            value={range}
            onChange={setRange}
          />
        }
        description={t('description')}
        title={t('title')}
      />

      <QueryBlock data={analytics} isPending={isPending} isRetrying={isRefetching} onRetry={() => void refetch()}>
        {(loaded) => <AnalyticsCharts analytics={loaded} isFaded={isPlaceholderData} />}
      </QueryBlock>
    </section>
  );
};
