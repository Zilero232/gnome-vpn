'use client';

import { useTranslations } from 'next-intl';

import { Text } from '@/ui-kit';

import type { InviteShareProps } from './InviteShare.types';

import { InviteLink } from '../InviteLink';
import { ShareMenu } from '../ShareMenu';

import s from './InviteShare.module.scss';

export const InviteShare = ({ overview }: InviteShareProps) => {
  const t = useTranslations('referrals');

  return (
    <section className={s.root}>
      <Text as='h3' className={s.title} size='sm'>
        {t('linkTitle')}
      </Text>

      <div className={s.links}>
        <InviteLink label={t('linkSite')} url={overview.link} />

        {overview.telegramLink && <InviteLink label={t('linkBot')} url={overview.telegramLink} />}
      </div>

      <ShareMenu url={overview.link} />
    </section>
  );
};
