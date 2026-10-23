'use client';

import { useTranslations } from 'next-intl';

import type { ChartFrameLabels } from '@/ui-kit';

export const useChartLabels = (): ChartFrameLabels => {
  const t = useTranslations('admin.common.view');

  return { chart: t('chart'), table: t('table'), view: t('label') };
};
