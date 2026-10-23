'use client';

import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { downloadFile } from '@/shared/lib';
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, QrCard, Text } from '@/ui-kit';

import type { ConfigDialogProps } from './ConfigDialog.types';

import s from './ConfigDialog.module.scss';

export const ConfigDialog = ({ file, isOpen, onOpenChange, onOpenChangeComplete }: ConfigDialogProps) => {
  const t = useTranslations('wireguard');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} onOpenChangeComplete={onOpenChangeComplete}>
      <DialogContent className={s.content}>
        <DialogHeader>
          <DialogTitle>{t('qrTitle')}</DialogTitle>
          <DialogDescription>{t('qrHint')}</DialogDescription>
        </DialogHeader>

        {file && (
          <>
            <QrCard title={t('qrTitle')} value={file.conf} />

            <Button className={s.download} size='lg' type='button' onClick={() => downloadFile({ filename: file.filename, content: file.conf })}>
              <Download aria-hidden size={18} />
              {t('download')}
            </Button>
          </>
        )}

        <Text className={s.note} size='xs' tone='muted'>
          {t('qrNote')}
        </Text>
      </DialogContent>
    </Dialog>
  );
};
