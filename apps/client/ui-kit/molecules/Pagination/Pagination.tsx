import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { PaginationProps } from './Pagination.types';

import { Button, Text } from '../../atoms';

import s from './Pagination.module.scss';

export const Pagination = ({ page, pages, labels, isDisabled = false, className, onChange }: PaginationProps) => {
  if (pages <= 1) {
    return null;
  }

  return (
    <div className={clsx(s.root, className)}>
      <Button disabled={isDisabled || page <= 1} variant='ghost' onClick={() => onChange(page - 1)}>
        <ChevronLeft aria-hidden size={16} />
        {labels.previous}
      </Button>

      <Text aria-live='polite' as='p' className={s.status} size='sm' tone='muted'>
        {labels.status}
      </Text>

      <Button disabled={isDisabled || page >= pages} variant='ghost' onClick={() => onChange(page + 1)}>
        {labels.next}
        <ChevronRight aria-hidden size={16} />
      </Button>
    </div>
  );
};
