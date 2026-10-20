import type { WebglTier } from '@/shared/lib';

export type GnomeCanvasProps = {
  tier: Exclude<WebglTier, 'off'>;
  isRunning: boolean;
  onReady: () => void;
  onFallback: () => void;
};
