'use client';

import { useMediaQuery } from '@siberiacancode/reactuse';
import { Check, ExternalLink, Link2, QrCode, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useHydrated } from '@/shared/lib';
import { Button, buttonVariants, IconSwap } from '@/ui-kit';

import type { IncyActionsProps } from './IncyActions.types';

import { INCY_COPY, TOUCH_DEVICE_QUERY } from '../../IncyCard.constants';

import s from './IncyActions.module.scss';

export const IncyActions = ({ deepLink, url, copiedId, onCopy, onShowQr }: IncyActionsProps) => {
  const t = useTranslations('incy');
  const isHydrated = useHydrated();
  const isTouchDevice = useMediaQuery(TOUCH_DEVICE_QUERY);

  const canOpenApp = isHydrated && isTouchDevice;
  const isCopied = (id: string) => copiedId === id;

  return (
    <div className={s.root}>
      {canOpenApp && (
        <a className={buttonVariants({ size: 'lg', class: s.action })} href={deepLink}>
          <ExternalLink aria-hidden size={16} />
          {t('openInIncy')}
        </a>
      )}

      <Button
        className={s.action}
        size='lg'
        variant={canOpenApp ? 'ghost' : 'primary'}
        onClick={() => void onCopy({ value: deepLink, message: t('deepLinkCopied'), id: INCY_COPY.target.deepLink })}
      >
        <IconSwap active={<Check size={16} />} idle={<Smartphone size={16} />} isActive={isCopied(INCY_COPY.target.deepLink)} />
        {t('copyDeepLink')}
      </Button>

      <Button
        className={s.action}
        size='lg'
        variant='ghost'
        onClick={() => void onCopy({ value: url, message: t('urlCopied'), id: INCY_COPY.target.url })}
      >
        <IconSwap active={<Check size={16} />} idle={<Link2 size={16} />} isActive={isCopied(INCY_COPY.target.url)} />
        {t('copyUrl')}
      </Button>

      <Button aria-haspopup='dialog' className={s.action} size='lg' variant='ghost' onClick={onShowQr}>
        <QrCode aria-hidden size={16} />
        {t('showQr')}
      </Button>
    </div>
  );
};
