'use client';

import { ChevronDown, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';
import { toast } from 'sonner';

import { ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { writeClipboard } from '@/shared/lib';
import { Button, ErrorBlock, LoadingBlock, Text } from '@/ui-kit';

import type { CopyInput, IncyCardProps } from './IncyCard.types';

import { useRotateLink, useSubscriptionLink } from '../model/hooks';
import { IncyActions, IncyQrDialog, IncyRotateDialog, OtherAppsList } from './components';
import { INCY_COPY } from './IncyCard.constants';

import s from './IncyCard.module.scss';

export const IncyCard = ({ onWireguard }: IncyCardProps) => {
  const t = useTranslations('incy');
  const { data: link, isPending, isError, isRefetching, refetch } = useSubscriptionLink();
  const rotate = useRotateLink();
  const otherAppsId = useId();

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isRotateOpen, setIsRotateOpen] = useState(false);
  const [isOtherOpen, setIsOtherOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!copiedId) {
      return;
    }

    const timer = setTimeout(setCopiedId, INCY_COPY.resetMs, null);

    return () => clearTimeout(timer);
  }, [copiedId]);

  const onRotate = () => {
    rotate.mutate(undefined, { onSettled: () => setIsRotateOpen(false) });
  };

  const onCopy = async ({ value, message, id }: CopyInput) => {
    try {
      await writeClipboard(value);
    } catch {
      toast.error(t('copyFailed'));

      return;
    }

    setCopiedId(id);
    toast.success(message);
  };

  if (isPending) {
    return <LoadingBlock label={t('loading')} />;
  }

  if (isError) {
    return <ErrorBlock isRetrying={isRefetching} message={t('unavailable')} retryLabel={t('retry')} onRetry={() => void refetch()} />;
  }

  return (
    <div className={s.root}>
      <div className={s.intro}>
        <Text as='h2' className={s.title}>
          {t('title')}
        </Text>

        <Text size='sm' tone='muted'>
          {t('hint')}
        </Text>

        <Link className={s.setupLink} href={ROUTES.setup}>
          {t('setupLink')}
        </Link>

        {onWireguard && (
          <Text size='xs' tone='muted'>
            {t.rich('wireguardHint', {
              tab: (chunks) => (
                <button className={s.tabLink} type='button' onClick={onWireguard}>
                  {chunks}
                </button>
              )
            })}
          </Text>
        )}
      </div>

      <IncyActions copiedId={copiedId} deepLink={link.deepLink} url={link.url} onCopy={onCopy} onShowQr={() => setIsQrOpen(true)} />

      <div className={s.other}>
        <button
          aria-controls={otherAppsId}
          aria-expanded={isOtherOpen}
          className={s.otherToggle}
          type='button'
          onClick={() => setIsOtherOpen((open) => !open)}
        >
          <ChevronDown aria-hidden className={s.chevron} data-open={isOtherOpen} size={16} />
          {t('otherApps')}
        </button>

        {isOtherOpen && (
          <div id={otherAppsId}>
            <OtherAppsList clients={link.clients} url={link.url} onCopy={onCopy} />
          </div>
        )}
      </div>

      <div className={s.rotate}>
        <Text size='xs' tone='muted'>
          {t('rotateHint')}
        </Text>

        <Button aria-haspopup='dialog' className={s.rotateButton} disabled={rotate.isPending} variant='ghost' onClick={() => setIsRotateOpen(true)}>
          <RefreshCw aria-hidden size={14} />
          {t('rotate')}
        </Button>
      </div>

      <IncyQrDialog deepLink={link.deepLink} isOpen={isQrOpen} url={link.url} onOpenChange={setIsQrOpen} />

      <IncyRotateDialog isOpen={isRotateOpen} isPending={rotate.isPending} onConfirm={onRotate} onOpenChange={setIsRotateOpen} />
    </div>
  );
};
