'use client';

import type { AdminGift } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';

import type { DataColumn } from '@/ui-kit';

import { UserLink } from '@/entities/admin/navigation';
import { useAdminFormat } from '@/entities/admin/records';
import { Text } from '@/ui-kit';

import { GiftBadge } from './components';

import s from './GiftsBlock.module.scss';

export const useGiftColumns = (): DataColumn<AdminGift>[] => {
  const t = useTranslations('admin.promo.gifts');
  const plans = useTranslations('plans.plans');
  const format = useAdminFormat();

  const deleted = (
    <Text as='span' size='sm' tone='muted'>
      {t('deleted')}
    </Text>
  );

  return [
    { key: 'code', header: t('columns.code'), isPrimary: true, cell: ({ code }) => <code className={s.code}>{code}</code> },
    { key: 'plan', header: t('columns.plan'), cell: ({ plan }) => (plan ? plans(plan) : '—') },
    { key: 'buyer', header: t('columns.buyer'), cell: ({ buyer }) => (buyer ? <UserLink user={buyer} /> : deleted) },
    { key: 'bought', header: t('columns.bought'), cell: ({ createdAt }) => format.date(createdAt) },
    {
      key: 'redeemed',
      header: t('columns.redeemed'),
      cell: ({ redeemedAt, redeemedBy }) =>
        redeemedAt ? (
          <span className={s.redeemed}>
            {format.date(redeemedAt)}
            {redeemedBy ? <UserLink user={redeemedBy} /> : deleted}
          </span>
        ) : (
          '—'
        )
    },
    { key: 'state', header: t('columns.state'), cell: (gift) => <GiftBadge gift={gift} /> }
  ];
};
