'use client';

import { clsx } from 'clsx';
import { isNonNullish } from 'remeda';

import type { LineChartProps } from './LineChart.types';

import { CHART_AXIS, ChartAxis, ChartTooltip, ChartXLabels, useChartWidth, xAxisLabels } from '../../molecules';
import { LineCrosshair, LinePaths } from './components';
import { LINE, LINE_SLOTS } from './LineChart.constants';
import { lineLayout } from './LineChart.helpers';
import { useLineCursor } from './use-line-cursor';

import s from './LineChart.module.scss';

export const LineChart = ({ labels, series, formatValue, formatTick = formatValue, label, height = LINE.height, className }: LineChartProps) => {
  const { ref, width } = useChartWidth();

  const shown = series.slice(0, LINE.maxSeries);
  const count = labels.length;
  const total = height + CHART_AXIS.axisBand;
  const layout = width > 0 && count > 0 ? lineLayout({ series: shown, count, width, height, formatTick }) : null;

  const { active, onKeyDown, onPointerMove, onFocus, onLeave } = useLineCursor({ count, layout });

  const rows = isNonNullish(active)
    ? shown.map((line, index) => ({ key: line.key, label: line.label, slot: LINE_SLOTS.at(index), value: formatValue(line.values.at(active) ?? 0) }))
    : [];

  return (
    <div ref={ref} className={clsx(s.root, className)} style={{ height: total }}>
      {layout && (
        <svg
          aria-label={label}
          className={s.svg}
          height={total}
          role='group'
          tabIndex={0}
          width={width}
          onBlur={onLeave}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
        >
          <ChartAxis box={layout.box} formatTick={formatTick} ticks={layout.ticks} y={layout.y} />
          <LinePaths layout={layout} series={shown} />
          {isNonNullish(active) && <LineCrosshair active={active} layout={layout} series={shown} />}
          <ChartXLabels labels={xAxisLabels({ labels, box: layout.box, at: layout.x })} y={total - 6} />

          <rect
            className={s.overlay}
            height={layout.box.bottom - layout.box.top}
            width={Math.max(layout.box.right - layout.box.left, 0)}
            x={layout.box.left}
            y={layout.box.top}
            onPointerLeave={onLeave}
            onPointerMove={onPointerMove}
          />
        </svg>
      )}

      <p aria-live='polite' className={s.readout}>
        {isNonNullish(active) ? [labels.at(active), ...rows.map((row) => `${row.label} ${row.value}`)].join(', ') : ''}
      </p>

      {layout && isNonNullish(active) && (
        <ChartTooltip
          rows={rows}
          side={layout.x(active) > width / 2 ? 'left' : 'right'}
          title={labels.at(active)}
          top={layout.box.top}
          x={layout.x(active)}
        />
      )}
    </div>
  );
};
