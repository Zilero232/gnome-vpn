import type { ColumnLayout, ColumnLayoutInput, ColumnPathInput } from './ColumnChart.types';

import { CHART_AXIS, niceTicks, plotBox, scaleY } from '../../molecules';
import { COLUMN } from './ColumnChart.constants';

export const columnLayout = ({ values, width, height, formatTick }: ColumnLayoutInput): ColumnLayout => {
  const ticks = niceTicks({ max: Math.max(...values, 0), count: CHART_AXIS.tickCount });
  const box = plotBox({ width, height, tickLabels: ticks.map(formatTick) });
  const band = values.length > 0 ? (box.right - box.left) / values.length : 0;
  const barWidth = Math.max(Math.min(COLUMN.maxBar, band - Math.min(COLUMN.gap, band * COLUMN.gapShare)), COLUMN.minBar);

  return {
    box,
    ticks,
    band,
    barWidth,
    y: scaleY({ max: ticks.at(-1) ?? 0, top: box.top, bottom: box.bottom }),
    left: (index) => box.left + index * band + (band - barWidth) / 2,
    center: (index) => box.left + (index + 0.5) * band
  };
};

export const columnPath = ({ x, y, width, base }: ColumnPathInput): string => {
  const height = base - y;

  if (height <= 0 || width <= 0) {
    return '';
  }

  const radius = Math.min(COLUMN.radius, width / 2, height);
  const right = x + width;

  return [
    `M${x},${base}`,
    `V${y + radius}`,
    `Q${x},${y} ${x + radius},${y}`,
    `H${right - radius}`,
    `Q${right},${y} ${right},${y + radius}`,
    `V${base}`,
    'Z'
  ].join(' ');
};
