import type { ReactNode } from 'react';

export type CardSectionProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};
