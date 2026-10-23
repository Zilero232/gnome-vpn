import type { ReactNode } from 'react';

export type SectionHeadProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  level?: 'h2' | 'h3';
  className?: string;
};
