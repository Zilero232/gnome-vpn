'use client';

import { useTranslations } from 'next-intl';

import { useAdminFormat, useChartLabels } from '@/entities/admin/records';
import { ChartFrame, LineChart, Panel, Text } from '@/ui-kit';

import type { PaidVsTrialsProps } from './PaidVsTrials.types';

import { dailySummary } from '../../../lib';

export const PaidVsTrials = ({ days, period, isFaded }: PaidVsTrialsProps) => {
  const t = useTranslations('admin.analytics.paidVsTrials');
  const table = useTranslations('admin.analytics.table');
  const format = useAdminFormat();
  const labels = useChartLabels();

  const paid = dailySummary({ days, metric: 'newPaid' }).total;
  const trials = dailySummary({ days, metric: 'trials' }).total;
  const caption = t('caption', { days: period });

  if (paid + trials === 0) {
    return (
      <Panel caption={caption} isFaded={isFaded} title={t('title')}>
        <Text size='sm' tone='muted'>
          {t('empty')}
        </Text>
      </Panel>
    );
  }

  return (
    <ChartFrame
      legend={[
        { key: 'newPaid', label: t('newPaid'), slot: 1, mark: 'line' },
        { key: 'trials', label: t('trials'), slot: 2, mark: 'line' }
      ]}
      table={{
        columns: [table('date'), t('newPaid'), t('trials')],
        rows: days.map((day) => ({ key: day.date, cells: [format.day(day.date), format.count(day.newPaid), format.count(day.trials)] }))
      }}
      isFaded={isFaded}
      labels={labels}
      summary={t('summary', { caption, paid, trials })}
      title={t('title')}
    >
      <LineChart
        series={[
          { key: 'newPaid', label: t('newPaid'), values: days.map((day) => day.newPaid) },
          { key: 'trials', label: t('trials'), values: days.map((day) => day.trials) }
        ]}
        formatTick={format.compactCount}
        formatValue={format.count}
        label={t('title')}
        labels={days.map((day) => format.day(day.date))}
      />
    </ChartFrame>
  );
};
