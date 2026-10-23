import { clsx } from 'clsx';

import type { BarListProps } from './BarList.types';

import { barShares } from './BarList.helpers';

import s from './BarList.module.scss';

export const BarList = ({ items, formatValue, formatShare, label, className }: BarListProps) => (
  <ol aria-label={label} className={clsx(s.root, className)}>
    {barShares(items).map((item) => (
      <li key={item.key} className={s.item}>
        <span className={s.label}>{item.label}</span>

        <span aria-hidden className={s.track} title={formatShare(item.share)}>
          <span className={s.fill} data-empty={item.share === 0} style={{ width: `${item.share * 100}%` }} />
        </span>

        <span className={s.numbers}>
          <span className={s.share}>{formatShare(item.share)}</span>
          {item.detail && <span className={s.detail}>{item.detail} · </span>}
          <span className={s.value}>{formatValue(item.value)}</span>
        </span>
      </li>
    ))}
  </ol>
);
