'use client';

import { useTranslations } from 'next-intl';
import { isNullish } from 'remeda';

import { useAdminFormat, useChartLabels } from '@/entities/admin/records';
import { ChartFrame, ColumnChart, Text } from '@/ui-kit';

import type { PeakChartProps } from './PeakChart.types';

import { peakSummary } from '../../../../../lib';

export const PeakChart = ({ peaks }: PeakChartProps) => {
  const t = useTranslations('admin.nodes.peaks');
  const format = useAdminFormat();
  const labels = useChartLabels();

  const { best } = peakSummary(peaks);
  const title = t('title');

  if (isNullish(best?.clients)) {
    return (
      <Text size='sm' tone='muted'>
        {t('empty')}
      </Text>
    );
  }

  const optional = (value: number | null, render: (value: number) => string) => (isNullish(value) ? '—' : render(value));
  const percent = (value: number) => format.percent(value / 100);

  return (
    <ChartFrame
      table={{
        columns: [t('time'), t('value'), t('users'), t('cpu'), t('memory')],
        rows: peaks.map((peak) => ({
          key: peak.date,
          cells: [
            peak.clientsAt ? format.dateTime(peak.clientsAt) : format.day(peak.date),
            optional(peak.clients, format.count),
            optional(peak.users, format.count),
            optional(peak.cpu, percent),
            optional(peak.memory, percent)
          ]
        }))
      }}
      labels={labels}
      summary={t('summary', { days: peaks.length, peak: format.count(best.clients), date: format.day(best.date) })}
      title={title}
    >
      <ColumnChart
        formatTick={(value) => (Number.isInteger(value) ? format.count(value) : '')}
        formatValue={format.count}
        height={150}
        label={title}
        points={peaks.map((peak) => ({ key: peak.date, label: format.day(peak.date), value: peak.clients ?? 0 }))}
      />
    </ChartFrame>
  );
};
