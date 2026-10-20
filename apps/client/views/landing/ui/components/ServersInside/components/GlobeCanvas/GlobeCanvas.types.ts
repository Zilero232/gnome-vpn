import type { RefObject } from 'react';

import type { WebglTier } from '@/shared/lib';

export type GlobeMarker = {
  key: string;
  lat: number;
  lon: number;
  isOrigin: boolean;
};

export type GlobeCanvasProps = {
  tier: Exclude<WebglTier, 'off'>;
  isRunning: boolean;
  markers: GlobeMarker[];
  labels: RefObject<(HTMLElement | null)[]>;
  onReady: () => void;
  onFallback: () => void;
};
