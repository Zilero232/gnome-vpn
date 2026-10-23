'use client';

import { useTranslations } from 'next-intl';

import { ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { Spinner, Text } from '@/ui-kit';

import { useTelegramLogin } from '../../model/hooks';

import s from './TelegramLoginButton.module.scss';

export const TelegramLoginButton = () => {
  const t = useTranslations('auth');
  const { slotRef, isUnreachable, isPending, isError } = useTelegramLogin();

  if (isUnreachable) {
    return null;
  }

  return (
    <div className={s.root}>
      <div ref={slotRef} className={s.slot} />

      {isPending && (
        <span className={s.pending} role='status'>
          <Spinner />

          <Text size='sm' tone='muted'>
            {t('telegramSignInPending')}
          </Text>
        </span>
      )}

      {isError && (
        <Text align='center' role='alert' size='sm' tone='danger'>
          {t('telegramSignInFailed')}
        </Text>
      )}

      <Text align='center' className={s.consent} size='xs' tone='muted'>
        {t.rich('telegramConsent', {
          consent: (chunks) => (
            <Link className={s.link} href={ROUTES.consent}>
              {chunks}
            </Link>
          )
        })}
      </Text>

      <span className={s.divider}>
        <Text size='sm' tone='muted'>
          {t('orEmail')}
        </Text>
      </span>
    </div>
  );
};
