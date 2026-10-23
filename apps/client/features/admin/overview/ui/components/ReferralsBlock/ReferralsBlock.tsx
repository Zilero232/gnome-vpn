'use client';

import type { AdminTopReferrer } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';

import type { DataColumn } from '@/ui-kit';

import { UserLink } from '@/entities/admin/navigation';
import { useAdminFormat } from '@/entities/admin/records';
import { DataTable, Panel, StatTile, Text } from '@/ui-kit';

import type { ReferralsBlockProps } from './ReferralsBlock.types';

import s from './ReferralsBlock.module.scss';

export const ReferralsBlock = ({ referrals, period, isFaded }: ReferralsBlockProps) => {
  const t = useTranslations('admin.analytics.referrals');
  const format = useAdminFormat();

  const columns: DataColumn<AdminTopReferrer>[] = [
    { key: 'user', header: t('columns.user'), isPrimary: true, cell: ({ user }) => <UserLink user={user} /> },
    { key: 'invited', header: t('columns.invited'), align: 'end', cell: ({ invited }) => format.count(invited) },
    { key: 'rewarded', header: t('columns.rewarded'), align: 'end', cell: ({ rewarded }) => format.count(rewarded) },
    { key: 'days', header: t('columns.days'), align: 'end', cell: ({ days }) => format.count(days) }
  ];

  return (
    <Panel caption={t('caption', { days: period })} isFaded={isFaded} title={t('title')}>
      {referrals.invited > 0 ? (
        <>
          <div className={s.tiles}>
            <StatTile label={t('invited')} value={format.count(referrals.invited)} />
            <StatTile label={t('rewarded')} value={format.count(referrals.rewarded)} />
            <StatTile label={t('referrerDays')} value={format.count(referrals.referrerDays)} />
            <StatTile label={t('friendDays')} value={format.count(referrals.friendDays)} />
          </div>

          <Text as='h4' className={s.subtitle}>
            {t('top')}
          </Text>

          <DataTable caption={t('top')} columns={columns} rowKey={(row) => row.user.id} rows={referrals.top} />
        </>
      ) : (
        <Text size='sm' tone='muted'>
          {t('empty')}
        </Text>
      )}
    </Panel>
  );
};
