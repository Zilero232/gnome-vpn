import type { ReactNode } from 'react';

export type TiltCardProps = {
  as?: 'article' | 'div' | 'li';
  className?: string;
  children: ReactNode;
};
