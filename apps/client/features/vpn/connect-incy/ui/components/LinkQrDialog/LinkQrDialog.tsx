'use client';

import { useTranslations } from 'next-intl';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, QrCard, Text } from '@/ui-kit';

import type { LinkQrDialogProps } from './LinkQrDialog.types';

import s from './LinkQrDialog.module.scss';

export const LinkQrDialog = ({ app, value, isOpen, onOpenChange }: LinkQrDialogProps) => {
  const t = useTranslations('incy');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={s.content}>
        <DialogHeader>
          <DialogTitle>{t('qrTitle')}</DialogTitle>
          <DialogDescription>{t('qrHint', { app })}</DialogDescription>
        </DialogHeader>

        <QrCard title={t('qrTitle')} value={value} />

        <Text className={s.note} size='xs' tone='muted'>
          {t('qrNote')}
        </Text>
      </DialogContent>
    </Dialog>
  );
};
