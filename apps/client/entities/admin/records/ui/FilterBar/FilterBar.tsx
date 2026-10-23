import type { FilterBarProps } from './FilterBar.types';

import s from './FilterBar.module.scss';

export const FilterBar = ({ label, children }: FilterBarProps) => (
  <div aria-label={label} className={s.root} role='group'>
    {children}
  </div>
);
