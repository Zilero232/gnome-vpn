'use client';

import { Gift } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useToastError } from '@/entities/app/locale';
import { celebrate, SubmitButton, Text } from '@/ui-kit';

import { useClaimTrial } from '../model/hooks';

import s from './TrialBanner.module.scss';

export const TrialBanner = () => {
  const t = useTranslations('trial');
  const toastError = useToastError();
  const claim = useClaimTrial();

  const onClaim = () => {
    claim.mutate(undefined, {
      onSuccess: () => celebrate(t('granted')),
      onError: toastError
    });
  };

  return (
    <div className={s.root}>
      <span aria-hidden className={s.icon}>
        <Gift size={22} />
      </span>

      <div className={s.body}>
        <Text as='h2' className={s.title}>
          {t('title')}
        </Text>

        <Text as='p' className={s.text}>
          {t('hint')}
        </Text>
      </div>

      <SubmitButton className={s.action} isPending={claim.isPending} size='md' type='button' onClick={onClaim}>
        {t('action')}
      </SubmitButton>
    </div>
  );
};
