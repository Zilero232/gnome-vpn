import type { Switch } from '@base-ui/react/switch';

export type SwitchProps = Omit<Switch.Root.Props, 'children' | 'className'> & {
  className?: string;
};
