'use client';

import { Check, Copy, ExternalLink, QrCode } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button, IconSwap, Text } from '@/ui-kit';

import type { LinkActionsProps } from './LinkActions.types';

import { useCopyLink } from '../../../model/hooks';
import { LinkQrDialog } from '../LinkQrDialog';

import s from './LinkActions.module.scss';

export const LinkActions = ({ app, value, openHref }: LinkActionsProps) => {
  const t = useTranslations('incy');
  const { isCopied, copy } = useCopyLink();

  const [isQrOpen, setIsQrOpen] = useState(false);

  const onOpen = async (href: string) => {
    await copy({ value, message: t('openCopied', { app }) });

    window.location.href = href;
  };

  return (
    <div className={s.root}>
      <div className={s.buttons}>
        {openHref && (
          <Button className={s.action} size='md' onClick={() => void onOpen(openHref)}>
            <ExternalLink aria-hidden size={16} />
            {t('open', { app })}
          </Button>
        )}

        <Button
          className={s.action}
          size='md'
          variant={openHref ? 'ghost' : 'primary'}
          onClick={() => void copy({ value, message: t('copied', { app }) })}
        >
          <IconSwap active={<Check size={16} />} idle={<Copy size={16} />} isActive={isCopied} />
          {t('copyFor', { app })}
        </Button>

        <Button aria-haspopup='dialog' className={s.action} size='md' variant='ghost' onClick={() => setIsQrOpen(true)}>
          <QrCode aria-hidden size={16} />
          {t('showQr')}
        </Button>
      </div>

      {openHref && (
        <Text as='p' size='xs' tone='muted'>
          {t('openHint', { app })}
        </Text>
      )}

      <LinkQrDialog app={app} isOpen={isQrOpen} value={value} onOpenChange={setIsQrOpen} />
    </div>
  );
};
