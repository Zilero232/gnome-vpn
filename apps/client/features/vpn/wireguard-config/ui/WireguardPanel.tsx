'use client';

import type { WireguardConfigFile } from '@gnomevpn/schemas';

import { TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { ErrorBlock, LoadingBlock, Text } from '@/ui-kit';

import { useWireguard } from '../model/hooks';
import { ConfigDialog, ConfigList, ConfigSteps } from './components';

import s from './WireguardPanel.module.scss';

export const WireguardPanel = () => {
  const t = useTranslations('wireguard');
  const { data: overview, isPending, isError, isRefetching, refetch } = useWireguard();

  const [shown, setShown] = useState<WireguardConfigFile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const show = (file: WireguardConfigFile) => {
    setShown(file);
    setIsDialogOpen(true);
  };

  if (isPending) {
    return <LoadingBlock label={t('loading')} />;
  }

  if (isError) {
    return <ErrorBlock isRetrying={isRefetching} message={t('unavailable')} retryLabel={t('retry')} onRetry={() => void refetch()} />;
  }

  return (
    <div className={s.root}>
      <ConfigSteps overview={overview} onCreated={show} />

      <Link className={s.setupLink} href={`${ROUTES.setup}#wireguard`}>
        {t('setupLink')}
      </Link>

      {overview.configs.length > 0 && <ConfigList configs={overview.configs} onShow={show} />}

      <Text as='p' className={s.caution} size='xs' tone='muted'>
        <TriangleAlert aria-hidden className={s.cautionIcon} size={14} />
        {t('note')}
      </Text>

      <ConfigDialog file={shown} isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} onOpenChangeComplete={(isOpen) => !isOpen && setShown(null)} />
    </div>
  );
};
