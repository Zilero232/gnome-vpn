'use client';

import { Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { match } from 'ts-pattern';

import { SubmitButton, Text } from '@/ui-kit';

import { useCheckConnection, useOutcomeFocus } from '../model/hooks';
import { CheckVerdict } from './components';

import s from './ConnectionCheck.module.scss';

export const ConnectionCheck = () => {
  const t = useTranslations('status.check');
  const check = useCheckConnection();
  const outcomeRef = useOutcomeFocus(check.status);

  const outcome = match(check)
    .with({ status: 'success' }, ({ data }) => <CheckVerdict verdict={data} />)
    .with({ status: 'error' }, () => (
      <Text as='p' className={s.failed} role='alert' size='sm'>
        {t('failed')}
      </Text>
    ))
    .otherwise(() => null);

  return (
    <section aria-labelledby='check-title' className={s.root}>
      <span aria-hidden className={s.icon}>
        <Globe size={22} strokeWidth={1.7} />
      </span>

      <div className={s.text}>
        <Text as='h2' className={s.title} id='check-title'>
          {t('title')}
        </Text>

        <Text as='p' className={s.body}>
          {t('body')}
        </Text>

        <div ref={outcomeRef} aria-live='polite' className={s.outcome} tabIndex={-1}>
          {outcome}
        </div>
      </div>

      <SubmitButton className={s.action} isPending={check.isPending} size='md' type='button' onClick={() => check.mutate()}>
        {check.isIdle ? t('action') : t('again')}
      </SubmitButton>
    </section>
  );
};
