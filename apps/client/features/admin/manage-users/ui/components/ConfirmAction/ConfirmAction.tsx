'use client';

import { useBoolean } from '@siberiacancode/reactuse';
import { useTranslations } from 'next-intl';

import { Button, ConfirmDialog } from '@/ui-kit';

import type { ConfirmActionProps } from './ConfirmAction.types';

export const ConfirmAction = ({
  label,
  title,
  description,
  confirmLabel,
  isPending,
  tone = 'primary',
  variant = 'ghost',
  onConfirm
}: ConfirmActionProps) => {
  const t = useTranslations('admin.common');

  const [isOpen, toggle] = useBoolean(false);

  return (
    <>
      <Button disabled={isPending} size='md' variant={variant} onClick={() => toggle(true)}>
        {label}
      </Button>

      <ConfirmDialog
        cancelLabel={t('cancel')}
        confirmLabel={confirmLabel}
        description={description}
        isOpen={isOpen}
        isPending={isPending}
        title={title}
        tone={tone}
        onConfirm={() => onConfirm(() => toggle(false))}
        onOpenChange={toggle}
      />
    </>
  );
};
