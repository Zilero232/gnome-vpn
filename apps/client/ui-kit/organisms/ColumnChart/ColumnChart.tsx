'use client';

import { clsx } from 'clsx';
import { useState } from 'react';
import { isNonNullish } from 'remeda';

import type { ColumnChartProps } from './ColumnChart.types';

import { CHART_AXIS, ChartAxis, ChartTooltip, ChartXLabels, useChartWidth, xAxisLabels } from '../../molecules';
import { COLUMN } from './ColumnChart.constants';
import { columnLayout } from './ColumnChart.helpers';
import { ColumnBars, ColumnHits } from './components';

import s from './ColumnChart.module.scss';

export const ColumnChart = ({ points, formatValue, formatTick = formatValue, label, height = COLUMN.height, className }: ColumnChartProps) => {
  const { ref, width } = useChartWidth();

  const [active, setActive] = useState<number | null>(null);

  const total = height + CHART_AXIS.axisBand;
  const values = points.map((point) => point.value);
  const layout = width > 0 ? columnLayout({ values, width, height, formatTick }) : null;
  const activePoint = isNonNullish(active) ? points.at(active) : undefined;

  return (
    <div ref={ref} className={clsx(s.root, className)} style={{ height: total }}>
      {layout && (
        <svg aria-label={label} className={s.svg} height={total} role='group' width={width}>
          <ChartAxis box={layout.box} formatTick={formatTick} ticks={layout.ticks} y={layout.y} />

          <ColumnBars active={active} formatValue={formatValue} layout={layout} values={values} />

          <ChartXLabels labels={xAxisLabels({ labels: points.map((point) => point.label), box: layout.box, at: layout.center })} y={total - 6} />

          <ColumnHits formatValue={formatValue} layout={layout} points={points} onActive={setActive} />
        </svg>
      )}

      {layout && activePoint && isNonNullish(active) && (
        <ChartTooltip
          rows={[{ key: activePoint.key, value: formatValue(activePoint.value) }]}
          side={layout.center(active) > width / 2 ? 'left' : 'right'}
          title={activePoint.label}
          top={layout.box.top}
          x={layout.center(active)}
        />
      )}
    </div>
  );
};
