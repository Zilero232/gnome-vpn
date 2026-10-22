import type { ReactNode } from 'react';

export type ChoiceOption<T extends string> = {
  value: T;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  isDisabled?: boolean;
};

export type ChoiceGroupProps<T extends string> = {
  value: T;
  options: ChoiceOption<T>[];
  label: ReactNode;
  labelAs?: 'h2' | 'h3' | 'span';
  layout?: 'cards' | 'tiles';
  columns?: 2 | 3;
  className?: string;
  onChange: (value: T) => void;
};
