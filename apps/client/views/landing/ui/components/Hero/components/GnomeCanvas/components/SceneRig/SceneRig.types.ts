import type { ReactNode } from 'react';

export type SceneRigProps = {
  children: ReactNode;
  onReady: () => void;
  onFallback: () => void;
};
