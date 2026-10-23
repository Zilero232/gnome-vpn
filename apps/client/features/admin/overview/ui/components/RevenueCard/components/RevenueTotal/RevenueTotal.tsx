'use client';

import { useTranslations } from 'next-intl';

import { useAdminFormat } from '@/entities/admin/records';
import { Text } from '@/ui-kit';

import type { RevenueTotalProps } from './RevenueTotal.types';

import s from './RevenueTotal.module.scss';

export const RevenueTotal = ({ total, label }: RevenueTotalProps) => {
  const t = useTranslations('admin.analytics.revenue');
  const format = useAdminFormat();

  return (
    <div className={s.root}>
      <Text as='span' size='xs' tone='muted' weight='semibold'>
        {label}
      </Text>

      <span className={s.figures}>
        <span className={s.amount}>{format.money(total.amount)}</span>
        <Text as='span' size='sm' tone='muted'>
          {t('count', { count: total.count })}
        </Text>
      </span>
    </div>
  );
};
