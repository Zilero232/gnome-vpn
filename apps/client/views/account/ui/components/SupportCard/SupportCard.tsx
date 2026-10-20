'use client';

import { useQuery } from '@tanstack/react-query';
import { LifeBuoy, Mail, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { getTelegramWidget } from '@/shared/api';
import { SITE } from '@/shared/config';
import { QUERY_KEYS } from '@/shared/constants';
import { Text } from '@/ui-kit';

import { SUPPORT_CARD } from './SupportCard.constants';

import s from './SupportCard.module.scss';

export const SupportCard = () => {
  const t = useTranslations('account.support');
  const { data: widget } = useQuery({ queryKey: QUERY_KEYS.telegramWidget(), queryFn: getTelegramWidget, retry: false });

  return (
    <section className={s.root}>
      <LifeBuoy aria-hidden className={s.icon} size={18} />

      <div className={s.body}>
        <Text as='h2' className={s.title}>
          {t('title')}
        </Text>

        <Text size='xs' tone='muted'>
          {t('body')}
        </Text>
      </div>

      <div className={s.links}>
        <a className={s.link} href={`mailto:${SITE.email}`}>
          <Mail aria-hidden size={14} />
          {t('email', { email: SITE.email })}
        </a>

        {widget?.botUsername && (
          <a className={s.link} href={`${SUPPORT_CARD.telegramBase}/${widget.botUsername.replace(/^@/u, '')}`} rel='noreferrer' target='_blank'>
            <Send aria-hidden size={14} />
            {t('bot')}
          </a>
        )}
      </div>
    </section>
  );
};
