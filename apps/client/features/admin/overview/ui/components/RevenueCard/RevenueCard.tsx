'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useAdminFormat } from '@/entities/admin/records';
import { BarList, Panel, Segmented, Text } from '@/ui-kit';

import type { RevenueView } from '../../../lib';
import type { RevenueCardProps } from './RevenueCard.types';

import { revenueSlices, revenueTotal } from '../../../lib';
import { RevenueTotal } from './components';
import { REVENUE_VIEWS } from './RevenueCard.constants';

export const RevenueCard = ({ revenueByPlan, revenueByKind, period, isFaded }: RevenueCardProps) => {
  const t = useTranslations('admin.analytics.revenue');
  const kinds = useTranslations('admin.payments.kindNames');
  const plans = useTranslations('plans.plans');
  const format = useAdminFormat();

  const [view, setView] = useState<RevenueView>('plan');

  const slices = revenueSlices({ revenueByPlan, revenueByKind, view });
  const total = revenueTotal(slices);
  const labelOf = (key: string) => (view === 'plan' ? plans(key) : kinds(key));
  const items = slices.map((slice) => ({
    key: slice.key,
    label: labelOf(slice.key),
    value: slice.amount,
    detail: t('count', { count: slice.count })
  }));

  return (
    <Panel
      actions={
        <Segmented<RevenueView>
          aria-label={t('viewLabel')}
          options={REVENUE_VIEWS.map((value) => ({ value, label: t(`views.${value}`) }))}
          value={view}
          onChange={setView}
        />
      }
      caption={t(`captions.${view}`, { days: period })}
      isFaded={isFaded}
      title={t('title')}
    >
      {total.count > 0 ? (
        <>
          <RevenueTotal label={t('total')} total={total} />

          <BarList formatShare={format.percent} formatValue={format.money} items={items} label={t(`views.${view}`)} />
        </>
      ) : (
        <Text size='sm' tone='muted'>
          {t('empty')}
        </Text>
      )}
    </Panel>
  );
};
