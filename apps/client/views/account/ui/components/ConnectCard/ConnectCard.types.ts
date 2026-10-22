import type { LucideIcon } from 'lucide-react';

export type ConnectWay = 'config' | 'link';

export type ConnectWaySpec = {
  hash: string;
  aliases: readonly string[];
  icon: LucideIcon;
  isRecommended: boolean;
};

export type ConnectCardProps = {
  hasAccess: boolean;
  isLoading: boolean;
  isUnavailable: boolean;
  onRetry: () => void;
};
