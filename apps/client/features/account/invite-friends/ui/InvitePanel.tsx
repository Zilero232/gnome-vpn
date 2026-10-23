'use client';

import { REFERRAL_POLICY } from '@gnomevpn/schemas';
import { Hourglass, Info, PartyPopper } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ErrorBlock, LoadingBlock, Text } from '@/ui-kit';

import { useReferrals } from '../model/hooks';
import { InviteHero, InviteRewards, InviteShare, InviteStats } from './components';

import s from './InvitePanel.module.scss';

export const InvitePanel = () => {
  const t = useTranslations('referrals');
  const { data: overview, isPending, isError, isRefetching, refetch } = useReferrals();

  if (isPending) {
    return <LoadingBlock label={t('loading')} />;
  }

  if (isError) {
    return <ErrorBlock isRetrying={isRefetching} message={t('unavailable')} retryLabel={t('retry')} onRetry={() => void refetch()} />;
  }

  return (
    <div className={s.root}>
      <InviteHero />

      <InviteShare overview={overview} />

      {overview.pendingDays > 0 && (
        <p className={s.note}>
          <Hourglass aria-hidden className={s.noteIcon} size={16} />
          {t('pending', { days: overview.pendingDays })}
        </p>
      )}

      {overview.isReferralRewarded && (
        <p className={s.note}>
          <PartyPopper aria-hidden className={s.noteIcon} size={16} />
          {t('referredRewarded', { days: overview.referralRewardedDays })}
        </p>
      )}

      {overview.isReferred && !overview.isReferralRewarded && (
        <p className={s.note}>
          <PartyPopper aria-hidden className={s.noteIcon} size={16} />
          {t('referred')}
        </p>
      )}

      <InviteRewards />

      {overview.invited > 0 && <InviteStats overview={overview} />}

      <Text as='p' className={s.rules} size='xs' tone='muted'>
        <Info aria-hidden className={s.rulesIcon} size={14} />
        {t('rules', { days: REFERRAL_POLICY.capDays })}
      </Text>
    </div>
  );
};
