'use client';

import { ADMIN_PERIOD_DAYS } from '@gnomevpn/schemas';
import { useTranslations } from 'next-intl';
import { isNonNullish } from 'remeda';

import { useAdminFormat } from '@/entities/admin/records';
import { StatTile } from '@/ui-kit';

import type { AnalyticsChartsProps } from './AnalyticsCharts.types';

import { conversionRate } from '../../../lib';
import { DailyChart } from '../DailyChart';
import { GrowthBlock } from '../GrowthBlock';
import { PaidVsTrials } from '../PaidVsTrials';
import { ReferralsBlock } from '../ReferralsBlock';
import { RevenueCard } from '../RevenueCard';

import s from './AnalyticsCharts.module.scss';

export const AnalyticsCharts = ({ analytics, isFaded }: AnalyticsChartsProps) => {
  const t = useTranslations('admin.analytics.conversion');
  const format = useAdminFormat();

  const { days, conversion } = analytics;
  const period = ADMIN_PERIOD_DAYS[analytics.range];
  const rate = conversionRate(conversion);
  const shared = { days, period, isFaded };

  return (
    <div className={s.root}>
      <RevenueCard isFaded={isFaded} period={period} revenueByKind={analytics.revenueByKind} revenueByPlan={analytics.revenueByPlan} />

      <div className={s.grid}>
        <DailyChart {...shared} formatTick={format.compactMoney} formatValue={format.money} metric='revenue' />
        <DailyChart {...shared} formatTick={format.compactCount} formatValue={format.count} metric='payments' />
        <DailyChart {...shared} formatTick={format.compactCount} formatValue={format.count} metric='signups' />
        <PaidVsTrials {...shared} />
      </div>

      <StatTile
        hint={
          isNonNullish(rate)
            ? t('hint', { converted: conversion.converted, trials: conversion.trials, days: period })
            : t('noTrials', { days: period })
        }
        label={t('label')}
        value={isNonNullish(rate) ? format.percent(rate) : t('none')}
      />

      <ReferralsBlock isFaded={isFaded} period={period} referrals={analytics.referrals} />

      <GrowthBlock growth={analytics.growth} isFaded={isFaded} period={period} />
    </div>
  );
};
