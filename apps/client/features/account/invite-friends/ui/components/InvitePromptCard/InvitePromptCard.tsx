'use client';

import { referralReward } from '@gnomevpn/schemas';
import { PartyPopper, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { ACCOUNT_TAB } from '@/shared/constants';
import { Button, Text } from '@/ui-kit';

import type { InvitePromptCardProps } from './InvitePromptCard.types';

import { useReferrals } from '../../../model/hooks';
import { InviteLink } from '../InviteLink';
import { ShareMenu } from '../ShareMenu';

import s from './InvitePromptCard.module.scss';

export const InvitePromptCard = ({ plan, onDismiss }: InvitePromptCardProps) => {
  const t = useTranslations('referrals');
  const plans = useTranslations('plans');
  const { data: overview } = useReferrals();
  const titleId = useId();

  if (!overview) {
    return null;
  }

  const reward = referralReward(plan);

  return (
    <section aria-labelledby={titleId} className={s.root}>
      <header className={s.head}>
        <span aria-hidden className={s.icon}>
          <PartyPopper size={16} />
        </span>

        <div className={s.headText}>
          <Text as='h3' className={s.title} id={titleId}>
            {t('prompt.title')}
          </Text>

          <Text as='p' size='xs' tone='muted'>
            {t('prompt.body', { plan: plans(`plans.${plan}`) })}
          </Text>
        </div>

        <Button aria-label={t('prompt.dismiss')} className={s.close} size='icon' title={t('prompt.dismiss')} variant='ghost' onClick={onDismiss}>
          <X aria-hidden size={16} />
        </Button>
      </header>

      <dl className={s.rewards}>
        <div className={s.reward}>
          <dt>{t('rewardFriendLabel')}</dt>
          <dd>{t('rewardFriend', { days: reward.friendDays })}</dd>
        </div>

        <div className={s.reward}>
          <dt>{t('rewardYouLabel')}</dt>
          <dd className={s.you}>{t('rewardYou', { days: reward.referrerDays })}</dd>
        </div>
      </dl>

      <InviteLink label={t('linkSite')} url={overview.link} />

      <ShareMenu url={overview.link} />

      <a className={s.more} href={`#${ACCOUNT_TAB.invite}`}>
        {t('prompt.more')}
      </a>
    </section>
  );
};
