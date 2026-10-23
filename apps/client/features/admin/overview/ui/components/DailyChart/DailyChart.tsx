'use client';

import { useTranslations } from 'next-intl';

import { useAdminFormat, useChartLabels } from '@/entities/admin/records';
import { ChartFrame, ColumnChart, Panel, Text } from '@/ui-kit';

import type { DailyChartProps } from './DailyChart.types';

import { dailyPoints, dailySummary } from '../../../lib';

export const DailyChart = ({ days, metric, period, isFaded, formatValue, formatTick }: DailyChartProps) => {
  const t = useTranslations('admin.analytics.daily');
  const table = useTranslations('admin.analytics.table');
  const format = useAdminFormat();
  const labels = useChartLabels();

  const points = dailyPoints({ days, metric, formatDay: format.day });
  const { total, peak } = dailySummary({ days, metric });
  const title = t(`${metric}.title`);
  const caption = t(`${metric}.caption`, { days: period });

  if (!peak) {
    return (
      <Panel caption={caption} isFaded={isFaded} title={title}>
        <Text size='sm' tone='muted'>
          {t(`${metric}.empty`)}
        </Text>
      </Panel>
    );
  }

  return (
    <ChartFrame
      table={{
        columns: [table('date'), title],
        rows: points.map((point) => ({ key: point.key, cells: [point.label, formatValue(point.value)] }))
      }}
      isFaded={isFaded}
      labels={labels}
      summary={t('summary', { caption, total: formatValue(total), peak: formatValue(peak.value), date: format.day(peak.date) })}
      title={title}
    >
      <ColumnChart formatTick={formatTick} formatValue={formatValue} label={title} points={points} />
    </ChartFrame>
  );
};
