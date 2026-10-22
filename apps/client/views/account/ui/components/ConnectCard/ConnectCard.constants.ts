import { FileKey2, Link2 } from 'lucide-react';

import { ACCOUNT_TAB } from '@/shared/constants';

import type { ConnectWay, ConnectWaySpec } from './ConnectCard.types';

export const CONNECT_WAYS: Record<ConnectWay, ConnectWaySpec> = {
  link: { hash: ACCOUNT_TAB.connect, aliases: [ACCOUNT_TAB.app], icon: Link2, isRecommended: true },
  config: { hash: ACCOUNT_TAB.wireguard, aliases: [], icon: FileKey2, isRecommended: false }
};
