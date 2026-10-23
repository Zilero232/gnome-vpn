import type { ReactNode } from 'react';

export type FactItem = {
  key: string;
  label: ReactNode;
  value: ReactNode;
  isMono?: boolean;
};

export type FactListProps = {
  items: FactItem[];
  className?: string;
};
