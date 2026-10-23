'use client';

import { Gift } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useToastError } from '@/entities/app/locale';
import { ActionBanner, celebrate } from '@/ui-kit';

import { useClaimTrial } from '../model/hooks';

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
    <ActionBanner
      actionLabel={t('action')}
      icon={Gift}
      isPending={claim.isPending}
      text={t('hint')}
      title={t('title')}
      tone='peach'
      onAction={onClaim}
    />
  );
};
