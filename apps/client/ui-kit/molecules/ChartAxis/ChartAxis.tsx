import type { ChartAxisProps, ChartXLabelsProps } from './ChartAxis.types';

import { CHART_AXIS } from './ChartAxis.constants';

import s from './ChartAxis.module.scss';

export const ChartAxis = ({ box, ticks, y, formatTick }: ChartAxisProps) => (
  <g aria-hidden>
    {ticks.map((tick) => (
      <g key={tick}>
        <line className={tick === 0 ? s.baseline : s.grid} x1={box.left} x2={box.right} y1={y(tick)} y2={y(tick)} />

        <text className={s.tick} dominantBaseline='middle' textAnchor='end' x={box.left - CHART_AXIS.tickGap / 2} y={y(tick)}>
          {formatTick(tick)}
        </text>
      </g>
    ))}
  </g>
);

export const ChartXLabels = ({ labels, y }: ChartXLabelsProps) => (
  <g aria-hidden>
    {labels.map((label) => (
      <text key={label.key} className={s.tick} textAnchor='middle' x={label.x} y={y}>
        {label.text}
      </text>
    ))}
  </g>
);
