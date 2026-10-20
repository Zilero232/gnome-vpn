import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type AccountTab = {
  value: string;
  label: string;
  icon: LucideIcon;
  render: () => ReactNode;
  aliases?: readonly string[];
};

export type AccountTabsProps = {
  items: AccountTab[];
  label: string;
  panelClassName?: string;
};
