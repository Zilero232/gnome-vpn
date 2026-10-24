import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type PageTab = {
  value: string;
  label: string;
  icon: LucideIcon;
  render: () => ReactNode;
  aliases?: readonly string[];
};

export type PageTabsLayout = 'bar' | 'rail';

export type PageTabsProps = {
  items: PageTab[];
  label: string;
  layout?: PageTabsLayout;
  panelClassName?: string;
};

export type PageTabsEdges = {
  start: boolean;
  end: boolean;
};

export type UsePageTabsInput = {
  items: PageTab[];
  layout: PageTabsLayout;
};
