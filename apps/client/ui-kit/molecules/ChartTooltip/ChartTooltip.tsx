import type { ChartTooltipProps } from './ChartTooltip.types';

import s from './ChartTooltip.module.scss';

export const ChartTooltip = ({ x, top, title, rows, side }: ChartTooltipProps) => (
  <div aria-hidden className={s.root} data-side={side} style={{ left: x, top }}>
    {rows.map((row) => (
      <p key={row.key} className={s.row}>
        {row.slot && <span className={s.key} data-slot={row.slot} />}

        <span className={s.value}>{row.value}</span>

        {row.label && <span className={s.label}>{row.label}</span>}
      </p>
    ))}

    <p className={s.title}>{title}</p>
  </div>
);
