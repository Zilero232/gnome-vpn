import type { ComponentProps } from 'react';

export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'danger' | 'ghost' | 'primary';
  size?: 'field' | 'icon' | 'lg' | 'md' | 'sm';
};
