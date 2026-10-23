'use client';

import { useTranslations } from 'next-intl';

import { UserLink } from '@/entities/admin/navigation';
import { useAdminFormat } from '@/entities/admin/records';
import { FactList, Text } from '@/ui-kit';

import type { ReferralSectionProps } from './ReferralSection.types';

import { CardSection } from '../CardSection';
import { InvitedTable } from './components';

export const ReferralSection = ({ referral }: ReferralSectionProps) => {
  const t = useTranslations('admin.user.referral');
  const format = useAdminFormat();

  const { referredBy } = referral;

  const reward = referredBy?.rewardedAt ? t('rewarded', { date: format.date(referredBy.rewardedAt), days: referredBy.days }) : t('notRewarded');

  return (
    <CardSection title={t('title')}>
      <FactList
        items={[
          { key: 'code', label: t('code'), value: referral.code ?? '—', isMono: true },
          {
            key: 'by',
            label: t('referredBy'),
            value: referredBy ? (
              <>
                <UserLink user={referredBy.user} />
                <Text as='span' size='xs' tone='muted'>
                  {t('since', { date: format.date(referredBy.createdAt) })} · {reward}
                </Text>
              </>
            ) : (
              '—'
            )
          },
          { key: 'invited', label: t('invited'), value: format.count(referral.invitedTotal) }
        ]}
      />

      {referral.invited.length > 0 && <InvitedTable invited={referral.invited} total={referral.invitedTotal} />}
    </CardSection>
  );
};
