import type { ReactNode } from 'react';

export type GlobeRigProps = {
  children: ReactNode;
  onReady: () => void;
  onFallback: () => void;
};
