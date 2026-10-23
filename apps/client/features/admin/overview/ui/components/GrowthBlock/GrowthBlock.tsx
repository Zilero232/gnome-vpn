'use client';

import { useTranslations } from 'next-intl';

import { useAdminFormat } from '@/entities/admin/records';
import { Panel, StatTile, Text } from '@/ui-kit';

import type { GrowthBlockProps } from './GrowthBlock.types';

import s from './GrowthBlock.module.scss';

export const GrowthBlock = ({ growth, period, isFaded }: GrowthBlockProps) => {
  const t = useTranslations('admin.analytics.growth');
  const format = useAdminFormat();

  const { referredPayments, winBack, checkoutReminders } = growth;
  const hasActivity = referredPayments.count + winBack.offered + winBack.redeemed + checkoutReminders.sent > 0;

  return (
    <Panel caption={t('caption', { days: period })} isFaded={isFaded} title={t('title')}>
      {hasActivity ? (
        <div className={s.tiles}>
          <StatTile
            hint={t('referredPayments.hint')}
            label={t('referredPayments.label')}
            value={t('referredPayments.value', { count: referredPayments.count, amount: format.money(referredPayments.amount) })}
          />

          <StatTile
            value={t('winBack.value', {
              offered: format.count(winBack.offered),
              redeemed: format.count(winBack.redeemed),
              revenue: format.money(winBack.revenue)
            })}
            hint={t('winBack.hint')}
            label={t('winBack.label')}
          />

          <StatTile
            value={t('checkoutReminders.value', {
              sent: format.count(checkoutReminders.sent),
              recovered: format.count(checkoutReminders.recovered)
            })}
            hint={t('checkoutReminders.hint')}
            label={t('checkoutReminders.label')}
          />
        </div>
      ) : (
        <Text size='sm' tone='muted'>
          {t('empty')}
        </Text>
      )}
    </Panel>
  );
};
