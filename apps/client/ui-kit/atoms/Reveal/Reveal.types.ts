import type { ReactNode } from 'react';

export type RevealProps = {
  as?: 'div' | 'li' | 'ol' | 'section' | 'ul';
  kind?: 'group' | 'item' | 'single';
  className?: string;
  children: ReactNode;
};
