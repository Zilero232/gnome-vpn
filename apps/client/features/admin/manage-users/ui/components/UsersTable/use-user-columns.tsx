'use client';

import type { AdminUser } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';

import type { DataColumn } from '@/ui-kit';

import { UserLink } from '@/entities/admin/navigation';
import { AccessBadge, telegramHandle, useAdminFormat } from '@/entities/admin/records';
import { Text } from '@/ui-kit';

import s from './UsersTable.module.scss';

export const useUserColumns = (): DataColumn<AdminUser>[] => {
  const t = useTranslations('admin.users.columns');
  const plans = useTranslations('plans.plans');
  const format = useAdminFormat();

  return [
    {
      key: 'email',
      header: t('email'),
      isPrimary: true,
      cell: ({ id, email, emailVerified, hasEmail }) => (
        <span className={s.email}>
          <UserLink user={{ id, email }} />
          {hasEmail && !emailVerified && (
            <Text as='span' size='xs' tone='muted'>
              {t('unverified')}
            </Text>
          )}
        </span>
      )
    },
    { key: 'created', header: t('created'), cell: ({ createdAt }) => format.date(createdAt) },
    {
      key: 'access',
      header: t('access'),
      cell: ({ access, currentPeriodEnd }) => (
        <span className={s.access}>
          <AccessBadge access={access} />
          {currentPeriodEnd && (
            <Text as='span' size='xs' tone='muted'>
              {t('until', { date: format.date(currentPeriodEnd), isOver: String(access === 'none') })}
            </Text>
          )}
        </span>
      )
    },
    { key: 'plan', header: t('plan'), cell: ({ plan, access }) => (plan && access === 'paid' ? plans(plan) : '—') },
    { key: 'devices', header: t('devices'), align: 'end', cell: ({ devices }) => format.count(devices) },
    {
      key: 'telegram',
      header: t('telegram'),
      cell: ({ telegram }) => (telegram ? telegramHandle(telegram) : '—')
    }
  ];
};
