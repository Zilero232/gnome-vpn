'use client';

import { useTranslations } from 'next-intl';

import { useAdminFormat } from '@/entities/admin/records';
import { BarList, Panel, Text } from '@/ui-kit';

import type { CampaignChartProps } from './CampaignChart.types';

import { CAMPAIGN_CHART } from '../../../config';
import { campaignBars } from '../../../lib';

import s from './CampaignChart.module.scss';

export const CampaignChart = ({ campaigns, isFaded }: CampaignChartProps) => {
  const t = useTranslations('admin.promo.effect');
  const format = useAdminFormat();

  const used = campaignBars({ campaigns, metric: 'used', limit: CAMPAIGN_CHART.limit });
  const revenue = campaignBars({ campaigns, metric: 'revenue', limit: CAMPAIGN_CHART.limit });

  if (used.length === 0) {
    return null;
  }

  return (
    <div className={s.root}>
      <Panel caption={t('usedCaption')} isFaded={isFaded} title={t('used')}>
        <BarList formatShare={format.percent} formatValue={format.count} items={used} label={t('used')} />
      </Panel>

      <Panel caption={t('revenueCaption')} isFaded={isFaded} title={t('revenue')}>
        {revenue.length > 0 ? (
          <BarList formatShare={format.percent} formatValue={format.money} items={revenue} label={t('revenue')} />
        ) : (
          <Text size='sm' tone='muted'>
            {t('noRevenue')}
          </Text>
        )}
      </Panel>
    </div>
  );
};
