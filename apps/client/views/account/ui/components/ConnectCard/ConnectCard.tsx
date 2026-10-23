'use client';

import { getHash, useHash, useMount } from '@siberiacancode/reactuse';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { entries } from 'remeda';

import { IncyCard, RotateLink } from '@/features/vpn/connect-incy';
import { RoutingCard } from '@/features/vpn/routing-settings';
import { WireguardPanel } from '@/features/vpn/wireguard-config';
import { ErrorBlock, LoadingBlock } from '@/ui-kit';

import type { ConnectCardProps, ConnectWay } from './ConnectCard.types';

import { AccessNotice, WayPicker } from './components';
import { CONNECT_WAYS } from './ConnectCard.constants';

import s from './ConnectCard.module.scss';

export const ConnectCard = ({ hasAccess, isLoading, isUnavailable, onRetry }: ConnectCardProps) => {
  const t = useTranslations('account.connect');

  const [way, setWay] = useState<ConnectWay>('link');

  const followHash = (hash: string) => {
    const found = entries(CONNECT_WAYS).find(([, { hash: own, aliases }]) => own === hash || aliases.includes(hash));

    if (found) {
      setWay(found[0]);
    }
  };

  const select = (next: ConnectWay) => {
    setWay(next);

    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${CONNECT_WAYS[next].hash}`);
  };

  useHash({ mode: 'initial', onChange: followHash });

  useMount(() => followHash(getHash()));

  if (isLoading) {
    return <LoadingBlock label={t('loading')} />;
  }

  if (isUnavailable) {
    return <ErrorBlock message={t('unavailable')} retryLabel={t('retry')} onRetry={onRetry} />;
  }

  return (
    <div className={s.root}>
      <WayPicker value={way} onChange={select} />

      {!hasAccess && <AccessNotice isWireguard={way === 'config'} />}

      {way === 'link' && <IncyCard />}

      {way === 'link' && <RoutingCard />}

      {way === 'link' && <RotateLink />}

      {way === 'config' && hasAccess && <WireguardPanel />}
    </div>
  );
};
