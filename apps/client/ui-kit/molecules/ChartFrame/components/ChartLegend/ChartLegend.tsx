import type { ChartLegendProps } from './ChartLegend.types';

import s from './ChartLegend.module.scss';

export const ChartLegend = ({ items }: ChartLegendProps) => (
  <ul className={s.root}>
    {items.map((item) => (
      <li key={item.key} className={s.item}>
        <span aria-hidden className={s.mark} data-mark={item.mark ?? 'rect'} data-slot={item.slot} />
        {item.label}
      </li>
    ))}
  </ul>
);
