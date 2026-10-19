'use client';

import type { WireguardConfigFile } from '@gnomevpn/schemas';

import { KeyRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ErrorBlock, LoadingBlock, Text } from '@/ui-kit';

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

  return (
    <div className={s.root}>
      <header className={s.head}>
        <KeyRound aria-hidden className={s.headIcon} size={22} />

        <div className={s.headBody}>
          <Text as='h2' className={s.title}>
            {t('title')}
          </Text>

          <Text as='p' size='sm' tone='muted'>
            {t('intro')}
          </Text>
        </div>
      </header>

      <Text as='p' className={s.note} size='sm'>
        {t('note')}
      </Text>

      <Text as='p' size='xs' tone='muted'>
        {t('slots', { count: overview.deviceCount, limit: overview.deviceLimit })}
      </Text>

      {overview.nodes.length === 0 ? (
        <Text as='p' className={s.note} size='sm'>
          {t('noServers')}
        </Text>
      ) : (
        <CreateConfigForm isFull={overview.deviceCount >= overview.deviceLimit} nodes={overview.nodes} onCreated={setShown} />
      )}

      <ConfigList configs={overview.configs} onShow={setShown} />

      <WireguardApps />

      <ConfigDialog file={shown} onClose={() => setShown(null)} />
    </div>
  );
};
