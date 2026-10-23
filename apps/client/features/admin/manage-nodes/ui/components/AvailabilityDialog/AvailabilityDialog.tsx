'use client';

import { useTranslations } from 'next-intl';

import { ConfirmDialog } from '@/ui-kit';

import type { AvailabilityDialogProps } from './AvailabilityDialog.types';

export const AvailabilityDialog = ({ node, name, isOpen, isPending, onOpenChange, onConfirm }: AvailabilityDialogProps) => {
  const t = useTranslations('admin.nodes');
  const action = node?.isAvailable ? 'off' : 'on';

  return (
    <ConfirmDialog
      cancelLabel={t('confirm.cancel')}
      confirmLabel={t(`confirm.${action}.action`)}
      description={t(`confirm.${action}.body`)}
      isOpen={isOpen}
      isPending={isPending}
      title={t(`confirm.${action}.title`, { name })}
      tone={action === 'off' ? 'danger' : 'primary'}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  );
};
