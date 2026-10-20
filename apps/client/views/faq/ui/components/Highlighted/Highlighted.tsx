import { isEmpty } from 'remeda';

import type { HighlightedProps } from './Highlighted.types';

import { highlight } from '../../../lib';

import s from './Highlighted.module.scss';

export const Highlighted = ({ text, terms }: HighlightedProps) => {
  if (isEmpty(terms)) {
    return text;
  }

  return highlight({ text, terms }).map(({ text: part, start, isMatch }) =>
    isMatch ? (
      <mark key={start} className={s.mark}>
        {part}
      </mark>
    ) : (
      <span key={start}>{part}</span>
    )
  );
};
