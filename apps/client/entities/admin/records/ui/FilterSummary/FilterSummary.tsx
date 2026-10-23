'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button, Text } from '@/ui-kit';

import type { FilterSummaryProps } from './FilterSummary.types';

import { useAdminFormat } from '../../model/hooks';

import s from './FilterSummary.module.scss';

export const FilterSummary = ({ count, onReset }: FilterSummaryProps) => {
  const t = useTranslations('admin.common.filters');
  const format = useAdminFormat();

  return (
    <div aria-live='polite' className={s.root}>
      <Text as='span' size='sm' tone='muted'>
        {t('found', { count: format.count(count) })}
      </Text>

      <Button size='sm' variant='ghost' onClick={onReset}>
        <X aria-hidden size={14} />
        {t('reset')}
      </Button>
    </div>
  );
};
