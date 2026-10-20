import type { ReactNode } from 'react';

export type PageIntroProps = {
  title: string;
  intro: string;
  aside?: ReactNode;
  children?: ReactNode;
};
