import type { ReactNode } from 'react';

export type PanelProps = {
  title: ReactNode;
  caption?: ReactNode;
  actions?: ReactNode;
  isFaded?: boolean;
  className?: string;
  children: ReactNode;
};
