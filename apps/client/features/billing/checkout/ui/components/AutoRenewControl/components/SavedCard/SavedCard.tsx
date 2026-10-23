'use client';

import { CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button, ConfirmDialog, Text } from '@/ui-kit';

import type { SavedCardProps } from './SavedCard.types';

import { useUnbindCard } from '../../../../../model/hooks';

import s from './SavedCard.module.scss';

export const SavedCard = ({ title, isAutoRenewOff }: SavedCardProps) => {
  const t = useTranslations('account');
  const unbind = useUnbindCard();

  const [isUnbindOpen, setIsUnbindOpen] = useState(false);

  const onUnbind = () => {
    unbind.mutate(undefined, { onSettled: () => setIsUnbindOpen(false) });
  };

  return (
    <div className={s.root}>
      <span aria-hidden className={s.icon}>
        <CreditCard size={15} />
      </span>

      <div className={s.text}>
        <Text as='span' className={s.title}>
          {title ?? t('cardBound')}
        </Text>

        <Text as='span' className={s.note}>
          {isAutoRenewOff ? t('autoRenewOff') : t('autoRenewOn')}
        </Text>
      </div>

      <Button aria-haspopup='dialog' className={s.unbind} disabled={unbind.isPending} variant='ghost' onClick={() => setIsUnbindOpen(true)}>
        {t('unbindCard')}
      </Button>

      <ConfirmDialog
        cancelLabel={t('unbindConfirmCancel')}
        confirmLabel={t('unbindConfirmAction')}
        description={t('unbindConfirmBody')}
        isOpen={isUnbindOpen}
        isPending={unbind.isPending}
        title={t('unbindConfirmTitle')}
        onConfirm={onUnbind}
        onOpenChange={setIsUnbindOpen}
      />
    </div>
  );
};
