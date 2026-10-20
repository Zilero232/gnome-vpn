'use client';

import { LifeBuoy, Mail, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { botLink } from '@/features/account/link-telegram';
import { useTelegramWidget } from '@/features/auth/telegram-sign-in';
import { SITE } from '@/shared/config';
import { Text } from '@/ui-kit';

import s from './SupportCard.module.scss';

export const SupportCard = () => {
  const t = useTranslations('account.support');
  const { data: widget } = useTelegramWidget();

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
          <a className={s.link} href={botLink({ bot: widget.botUsername })} rel='noreferrer' target='_blank'>
            <Send aria-hidden size={14} />
            {t('bot')}
          </a>
        )}
      </div>
    </section>
  );
};
