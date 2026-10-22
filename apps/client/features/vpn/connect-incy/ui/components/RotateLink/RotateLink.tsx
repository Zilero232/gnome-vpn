'use client';

import { RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button, ConfirmDialog, Text } from '@/ui-kit';

import { useRotateLink } from '../../../model/hooks';

import s from './RotateLink.module.scss';

export const RotateLink = () => {
  const t = useTranslations('incy');
  const rotate = useRotateLink();

  const [isOpen, setIsOpen] = useState(false);

  const onConfirm = () => {
    rotate.mutate(undefined, { onSettled: () => setIsOpen(false) });
  };

  return (
    <section className={s.root}>
      <div className={s.text}>
        <Text as='h3' className={s.title} size='sm'>
          {t('rotateTitle')}
        </Text>

        <Text as='p' size='xs' tone='muted'>
          {t('rotateHint')}
        </Text>
      </div>

      <Button aria-haspopup='dialog' className={s.button} disabled={rotate.isPending} variant='ghost' onClick={() => setIsOpen(true)}>
        <RefreshCw aria-hidden size={14} />
        {t('rotate')}
      </Button>

      <ConfirmDialog
        cancelLabel={t('rotateConfirmCancel')}
        confirmLabel={t('rotateConfirmAction')}
        description={t('rotateConfirmBody')}
        isOpen={isOpen}
        isPending={rotate.isPending}
        title={t('rotateConfirmTitle')}
        onConfirm={onConfirm}
        onOpenChange={setIsOpen}
      />
    </section>
  );
};
