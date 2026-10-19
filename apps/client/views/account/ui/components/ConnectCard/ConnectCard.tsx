'use client';

import { getHash, useHash } from '@siberiacancode/reactuse';
import { FileKey2, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { IncyCard } from '@/features/vpn/connect-incy';
import { WireguardPanel } from '@/features/vpn/wireguard-config';
import { ACCOUNT_TAB } from '@/shared/constants';
import { Segmented } from '@/ui-kit';

import type { ConnectCardProps, ConnectWay } from './ConnectCard.types';

import s from './ConnectCard.module.scss';

export const ConnectCard = ({ hasWireguard }: ConnectCardProps) => {
  const t = useTranslations('account.connect');

  const [way, setWay] = useState<ConnectWay>('incy');

  const followHash = (hash: string) => {
    if (hash === ACCOUNT_TAB.wireguard) {
      setWay('wireguard');
    }

    if (hash === ACCOUNT_TAB.connect) {
      setWay('incy');
    }
  };

  const select = (next: ConnectWay) => {
    setWay(next);

    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}#${ACCOUNT_TAB[next === 'incy' ? 'connect' : 'wireguard']}`
    );
  };

  useHash({ mode: 'initial', onChange: followHash });

  useEffect(() => {
    if (getHash() === ACCOUNT_TAB.wireguard) {
      setWay('wireguard');
    }
  }, []);

  if (!hasWireguard) {
    return <IncyCard />;
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

      {way === 'incy' ? <IncyCard onWireguard={() => select('wireguard')} /> : <WireguardPanel />}
    </div>
  );
};
