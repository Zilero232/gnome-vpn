import type { ReactNode } from 'react';

export type StepListItem = {
  key: string;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
};

export type StepListProps = {
  steps: StepListItem[];
  variant?: 'panel' | 'plain';
  className?: string;
};
