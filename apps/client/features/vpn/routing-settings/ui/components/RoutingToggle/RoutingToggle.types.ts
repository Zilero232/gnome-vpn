import type { LucideIcon } from 'lucide-react';

export type RoutingToggleProps = {
  label: string;
  hint: string;
  icon: LucideIcon;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};
