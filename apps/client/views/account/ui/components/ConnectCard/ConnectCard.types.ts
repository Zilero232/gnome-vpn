import type { CONNECT_WAY_HASH } from './ConnectCard.constants';

export type ConnectWay = keyof typeof CONNECT_WAY_HASH;

export type ConnectCardProps = {
  hasAccess: boolean;
  isLoading: boolean;
  isUnavailable: boolean;
  onRetry: () => void;
};
