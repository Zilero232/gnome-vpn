'use client';

import { useTranslations } from 'next-intl';

import { botLink } from '@/features/account/link-telegram';
import { useTelegramWidget } from '@/features/auth/telegram-sign-in';
import { SITE } from '@/shared/config';
import { GnomeBadge, Text } from '@/ui-kit';

import s from './FaqEmpty.module.scss';

export const FaqEmpty = () => {
  const t = useTranslations('faq.search');
  const { data: widget } = useTelegramWidget();

  return (
    <div className={s.root}>
      <GnomeBadge className={s.badge} size={64} />
      <Text as='p' className={s.text}>
        {t('empty')}
      </Text>
      <Text as='p' className={s.contact}>
        {t('emptyContact')}{' '}
        <a className={s.link} href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
        {widget?.botUsername && (
          <>
            {' · '}
            <a className={s.link} href={botLink({ bot: widget.botUsername })} rel='noreferrer' target='_blank'>
              {t('telegram')}
            </a>
          </>
        )}
      </Text>
    </div>
  );
};
