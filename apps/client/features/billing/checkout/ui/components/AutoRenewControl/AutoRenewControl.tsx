'use client';

import { useTranslations } from 'next-intl';
import { match } from 'ts-pattern';

import { OfferNote } from '@/entities/billing/payment-notes';
import { SubmitButton, Text } from '@/ui-kit';

import type { AutoRenewControlProps } from './AutoRenewControl.types';

import { useBindCard, useCancelAutoRenew, useResumeAutoRenew } from '../../../model/hooks';
import { SavedCard } from './components';

import s from './AutoRenewControl.module.scss';

export const AutoRenewControl = ({ subscription }: AutoRenewControlProps) => {
  const t = useTranslations('account');
  const bind = useBindCard();
  const cancel = useCancelAutoRenew();
  const resume = useResumeAutoRenew();

  const { isRecurringAvailable, hasPaymentMethod, cancelAtPeriodEnd, savedCardTitle } = subscription;

  return match({ isRecurringAvailable, hasPaymentMethod, cancelAtPeriodEnd })
    .with({ isRecurringAvailable: false }, () => null)
    .with({ hasPaymentMethod: false }, () => (
      <div className={s.prompt}>
        <Text size='xs' tone='muted'>
          {t('noPaymentMethod')}
        </Text>

        <SubmitButton isPending={bind.isPending} size='md' type='button' variant='ghost' onClick={() => bind.mutate()}>
          {t('bindCard')}
        </SubmitButton>

        <OfferNote className={s.offer} kind='autoRenew' />
      </div>
    ))
    .with({ cancelAtPeriodEnd: true }, () => (
      <div className={s.root}>
        <SavedCard isAutoRenewOff title={savedCardTitle} />

        <SubmitButton isPending={resume.isPending} size='md' type='button' variant='ghost' onClick={() => resume.mutate()}>
          {t('resumeAutoRenew')}
        </SubmitButton>

        <OfferNote kind='autoRenew' />
      </div>
    ))
    .otherwise(() => (
      <div className={s.root}>
        <SavedCard isAutoRenewOff={false} title={savedCardTitle} />

        <SubmitButton isPending={cancel.isPending} size='md' type='button' variant='ghost' onClick={() => cancel.mutate()}>
          {t('cancelAutoRenew')}
        </SubmitButton>
      </div>
    ));
};
