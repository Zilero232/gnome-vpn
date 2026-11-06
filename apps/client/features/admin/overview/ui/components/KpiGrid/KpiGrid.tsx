'use client';

import { useTranslations } from 'next-intl';
import { sumBy } from 'remeda';

import { useAdminFormat } from '@/entities/admin/records';
import { StatTile } from '@/ui-kit';

import type { KpiGridProps } from './KpiGrid.types';

import { visibleTrend } from '../../../lib';

import s from './KpiGrid.module.scss';

export const KpiGrid = ({ overview }: KpiGridProps) => {
  const t = useTranslations('admin.overview.kpi');
  const plans = useTranslations('plans.plans');
  const format = useAdminFormat();

  const { users, subscriptions, payments, nodes, online, trend } = overview;
  const paid = sumBy(subscriptions.paid, (entry) => entry.count);
  const totalNodes = nodes.up + nodes.degraded + nodes.down + nodes.off;
  const byPlan = subscriptions.paid
    .filter((entry) => entry.count > 0)
    .map((entry) => t('plan', { plan: plans(entry.plan), count: entry.count }))
    .join(' · ');

  return (
    <div className={s.root}>
      <StatTile
        hint={t('users.hint', { day: users.day, week: users.week })}
        label={t('users.label')}
        trend={visibleTrend(trend.signups)}
        value={format.count(users.total)}
      />
      <StatTile
        hint={online ? t('online.hint', { users: online.users }) : t('online.unknown')}
        label={t('online.label')}
        value={online ? format.count(online.clients) : '—'}
      />
      <StatTile hint={paid > 0 ? byPlan : t('paidNone')} label={t('paid')} value={format.count(paid)} />
      <StatTile
        hint={payments.count > 0 ? t('payments.hint', { count: payments.count }) : t('payments.none')}
        label={t('payments.label', { days: payments.days })}
        trend={visibleTrend(trend.revenue)}
        value={format.money(payments.amount)}
      />
      <StatTile label={t('trials')} value={format.count(subscriptions.trials)} />
      <StatTile hint={t('autoRenew.hint', { paid })} label={t('autoRenew.label')} value={format.count(subscriptions.autoRenew)} />
      <StatTile hint={t('devices.hint', { chats: format.count(overview.chats) })} label={t('devices.label')} value={format.count(overview.devices)} />
      <StatTile
        hint={t('nodes.hint', { degraded: nodes.degraded, down: nodes.down, off: nodes.off })}
        label={t('nodes.label')}
        value={t('nodes.value', { up: nodes.up, total: totalNodes })}
      />
    </div>
  );
};
