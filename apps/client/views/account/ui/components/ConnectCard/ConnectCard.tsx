'use client';

import { getHash, useHash, useMount } from '@siberiacancode/reactuse';
import { FileKey2, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { IncyCard } from '@/features/vpn/connect-incy';
import { WireguardPanel } from '@/features/vpn/wireguard-config';
import { ErrorBlock, LoadingBlock, Segmented } from '@/ui-kit';

import type { ConnectCardProps, ConnectWay } from './ConnectCard.types';

import { AccessNotice } from './components';
import { CONNECT_WAY_BY_HASH, CONNECT_WAY_HASH } from './ConnectCard.constants';

import s from './ConnectCard.module.scss';

export const ConnectCard = ({ hasAccess, isLoading, isUnavailable, onRetry }: ConnectCardProps) => {
  const t = useTranslations('account.connect');

  const [way, setWay] = useState<ConnectWay>('incy');
  const [shouldFocusWireguard, setShouldFocusWireguard] = useState(false);

  const followHash = (hash: string) => {
    const next = CONNECT_WAY_BY_HASH.get(hash);

    if (next) {
      setWay(next);
    }
  };

  const select = (next: ConnectWay) => {
    setWay(next);
    setShouldFocusWireguard(false);

    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${CONNECT_WAY_HASH[next]}`);
  };

  const openWireguard = () => {
    select('wireguard');
    setShouldFocusWireguard(true);
  };

  useHash({ mode: 'initial', onChange: followHash });

  useMount(() => followHash(getHash()));

  if (isLoading) {
    return <LoadingBlock label={t('loading')} />;
  }

  if (isUnavailable) {
    return <ErrorBlock message={t('unavailable')} retryLabel={t('retry')} onRetry={onRetry} />;
  }

  if (!hasAccess) {
    return (
      <div className={s.root}>
        <AccessNotice isWireguard={way === 'wireguard'} />

        <IncyCard />
      </div>
    );
  }

  return (
    <div className={s.root}>
      <Segmented
        options={[
          { value: 'incy', label: t('incy'), icon: <Smartphone size={15} /> },
          { value: 'wireguard', label: t('wireguard'), icon: <FileKey2 size={15} /> }
        ]}
        aria-label={t('label')}
        className={s.switch}
        value={way}
        onChange={select}
      />

      {way === 'incy' ? <IncyCard onWireguard={openWireguard} /> : <WireguardPanel shouldFocusTitle={shouldFocusWireguard} />}
    </div>
  );
};
