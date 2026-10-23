import type { Checkbox } from '@base-ui/react/checkbox';

export type CheckboxProps = Omit<Checkbox.Root.Props, 'children' | 'className'> & {
  className?: string;
};
