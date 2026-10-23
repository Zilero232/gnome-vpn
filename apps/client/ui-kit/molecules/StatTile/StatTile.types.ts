import type { ReactNode } from 'react';

export type StatTileProps = {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  trend?: number[];
  className?: string;
};
