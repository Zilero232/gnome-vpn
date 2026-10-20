'use client';

import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';

import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Text } from '@/ui-kit';

import type { ConfigDialogProps } from './ConfigDialog.types';

import { downloadConf } from '../../../lib';

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
            <div className={s.code}>
              <QRCodeSVG className={s.svg} level='M' marginSize={2} size={260} title={t('qrTitle')} value={file.conf} />
            </div>

            <Button className={s.download} size='lg' type='button' onClick={() => downloadConf(file)}>
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
