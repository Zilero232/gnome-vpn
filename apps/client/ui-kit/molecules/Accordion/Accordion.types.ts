import type { ReactNode } from 'react';

export type AccordionItem = {
  value: string;
  title: ReactNode;
  content: ReactNode;
};

export type AccordionProps = {
  items: AccordionItem[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  className?: string;
};
