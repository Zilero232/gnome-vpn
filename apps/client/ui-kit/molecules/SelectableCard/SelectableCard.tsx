import type { SelectableCardProps } from './SelectableCard.types';

import { selectableCard } from './SelectableCard.variants';

export const SelectableCard = ({ isSelected = false, type = 'button', className, children, ...props }: SelectableCardProps) => (
  <button aria-pressed={isSelected} className={selectableCard({ isSelected, class: className })} type={type} {...props}>
    {children}
  </button>
);
