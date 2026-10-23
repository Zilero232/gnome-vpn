import type { LucideIcon } from 'lucide-react';

export type ActionBannerProps = {
  icon: LucideIcon;
  title: string;
  text: string;
  actionLabel: string;
  isPending?: boolean;
  tone?: 'accent' | 'peach';
  className?: string;
  onAction: () => void;
};
