'use client';

import type { WireguardConfigFile } from '@gnomevpn/schemas';

import { TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Badge, ErrorBlock, LoadingBlock, Text } from '@/ui-kit';

import { useWireguard } from '../model/hooks';
import { ConfigDialog, ConfigList, CreateConfigForm, WireguardApps } from './components';

import s from './WireguardPanel.module.scss';

export const WireguardPanel = () => {
  const t = useTranslations('wireguard');
  const { data: overview, isPending, isError, isRefetching, refetch } = useWireguard();

  const [shown, setShown] = useState<WireguardConfigFile | null>(null);

  if (isPending) {
    return <LoadingBlock label={t('loading')} />;
  }

  if (isError) {
    return <ErrorBlock isRetrying={isRefetching} message={t('unavailable')} retryLabel={t('retry')} onRetry={() => void refetch()} />;
  }

  const isFull = overview.deviceCount >= overview.deviceLimit;

  return (
    <div className={s.root}>
      <header className={s.head}>
        <div className={s.headText}>
          <Text as='h2' className={s.title}>
            {t('title')}
          </Text>

          <Text as='p' size='sm' tone='muted'>
            {t('intro')}
          </Text>
        </div>

        <Badge className={s.slots} tone={isFull ? 'danger' : 'muted'}>
          {t('slots', { count: overview.deviceCount, limit: overview.deviceLimit })}
        </Badge>
      </header>

      {overview.nodes.length === 0 ? (
        <Text as='p' className={s.empty} size='sm' tone='muted'>
          {t('noServers')}
        </Text>
      ) : (
        <CreateConfigForm isFull={isFull} nodes={overview.nodes} onCreated={setShown} />
      )}

      {overview.configs.length > 0 && <ConfigList configs={overview.configs} onShow={setShown} />}

      <WireguardApps />

      <Text as='p' className={s.caution} size='xs' tone='muted'>
        <TriangleAlert aria-hidden className={s.cautionIcon} size={14} />
        {t('note')}
      </Text>

      <ConfigDialog file={shown} onClose={() => setShown(null)} />
    </div>
  );
};
