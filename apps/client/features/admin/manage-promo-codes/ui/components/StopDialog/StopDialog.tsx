'use client';

import { useTranslations } from 'next-intl';

import { ConfirmDialog } from '@/ui-kit';

import type { StopDialogProps } from './StopDialog.types';

export const StopDialog = ({ code, isOpen, isPending, onOpenChange, onConfirm }: StopDialogProps) => {
  const t = useTranslations('admin.promo.campaigns.stop');

  return (
    <ConfirmDialog
      cancelLabel={t('cancel')}
      confirmLabel={t('confirm', { code })}
      description={t('body')}
      isOpen={isOpen}
      isPending={isPending}
      title={t('title', { code })}
      tone='danger'
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  );
};
