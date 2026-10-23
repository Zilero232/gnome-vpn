'use client';

import { useTranslations } from 'next-intl';
import { match } from 'ts-pattern';

import { useUnsubscribe } from '@/features/account/manage-consents';
import { ACCOUNT_TAB, ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { buttonVariants, LoadingBlock, StatusScreen, SubmitButton } from '@/ui-kit';

import s from './UnsubscribePage.module.scss';

export const UnsubscribePage = () => {
  const t = useTranslations('unsubscribe');
  const { state, isRetrying, retry } = useUnsubscribe();

  const profileHref = `${ROUTES.account}#${ACCOUNT_TAB.profile}`;

  return match(state)
    .with('pending', () => (
      <main className={s.pending}>
        <LoadingBlock label={t('pending')} />
      </main>
    ))
    .with('unsubscribed', () => (
      <StatusScreen isInline body={t('unsubscribed.body')} code={t('unsubscribed.code')} title={t('unsubscribed.title')}>
        <Link className={buttonVariants({ variant: 'ghost' })} href={profileHref}>
          {t('unsubscribed.account')}
        </Link>
      </StatusScreen>
    ))
    .with('invalid', () => (
      <StatusScreen isInline body={t('invalid.body')} code={t('invalid.code')} title={t('invalid.title')} tone='danger'>
        <Link className={buttonVariants({ variant: 'ghost' })} href={profileHref}>
          {t('invalid.account')}
        </Link>
      </StatusScreen>
    ))
    .with('failed', () => (
      <StatusScreen isInline body={t('failed.body')} code={t('failed.code')} title={t('failed.title')} tone='danger'>
        <SubmitButton isPending={isRetrying} size='md' type='button' onClick={retry}>
          {t('failed.retry')}
        </SubmitButton>
      </StatusScreen>
    ))
    .exhaustive();
};
