'use client';

import { Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button, Text } from '@/ui-kit';

import type { InviteShareProps } from './InviteShare.types';

import { useCopyLink } from '../../../model/hooks';
import { InviteLink } from '../InviteLink';
import { ShareMenu } from '../ShareMenu';

import s from './InviteShare.module.scss';

export const InviteShare = ({ overview }: InviteShareProps) => {
  const t = useTranslations('referrals');
  const copy = useCopyLink();

  return (
    <section className={s.root}>
      <Text as='h3' className={s.title} size='sm'>
        {t('linkTitle')}
      </Text>

      <div className={s.links}>
        <InviteLink label={t('linkSite')} url={overview.link} />

        {overview.telegramLink && <InviteLink label={t('linkBot')} url={overview.telegramLink} />}
      </div>

      <div className={s.actions}>
        <ShareMenu url={overview.link} />

        <Button className={s.copy} size='lg' type='button' variant='ghost' onClick={() => void copy(overview.link)}>
          <Copy aria-hidden size={18} />
          {t('copy')}
        </Button>
      </div>
    </section>
  );
};
