import { clsx } from 'clsx';

import type { FactListProps } from './FactList.types';

import s from './FactList.module.scss';

export const FactList = ({ items, className }: FactListProps) => (
  <dl className={clsx(s.root, className)}>
    {items.map((item) => (
      <div key={item.key} className={s.fact}>
        <dt className={s.label}>{item.label}</dt>
        <dd className={s.value} data-mono={item.isMono === true}>
          {item.value}
        </dd>
      </div>
    ))}
  </dl>
);
