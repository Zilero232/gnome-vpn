'use client';

import { useTranslations } from 'next-intl';

import { useAdminFormat } from '@/entities/admin/records';
import { ConfirmDialog } from '@/ui-kit';

import type { RefundDialogProps } from './RefundDialog.types';

export const RefundDialog = ({ payment, isOpen, isPending, onOpenChange, onConfirm }: RefundDialogProps) => {
  const t = useTranslations('admin.payments.refund');
  const format = useAdminFormat();

  return (
    <ConfirmDialog
      cancelLabel={t('cancel')}
      confirmLabel={t('confirm')}
      description={t('body', { who: payment?.user?.email ?? t('deletedUser') })}
      isOpen={isOpen}
      isPending={isPending}
      title={t('title', { amount: format.money(payment?.amount ?? 0) })}
      tone='danger'
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  );
};
