import { sortBy } from 'remeda';

import type { EndLabelsFitInput, LineLayout, LineLayoutInput, LinePoint } from './LineChart.types';

import { CHART_AXIS, niceTicks, plotBox, scaleY, textWidth } from '../../molecules';
import { LINE } from './LineChart.constants';

export const endLabelsFit = ({ ys, minGap }: EndLabelsFitInput): boolean => {
  const sorted = sortBy(ys, (y) => y);

  return sorted.every((y, index) => index === 0 || y - sorted[index - 1] >= minGap);
};

export const linePath = (points: LinePoint[]): string =>
  points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export const lineLayout = ({ series, count, width, height, formatTick }: LineLayoutInput): LineLayout => {
  const ticks = niceTicks({ max: Math.max(...series.flatMap((line) => line.values), 0), count: CHART_AXIS.tickCount });
  const y = scaleY({ max: ticks.at(-1) ?? 0, top: CHART_AXIS.topGap, bottom: height });
  const labelRoom = Math.max(...series.map((line) => textWidth(line.label)), 0) + LINE.endLabelGap * 2;

  const hasEndLabels =
    series.length > 0 &&
    width >= LINE.endLabelMinWidth &&
    endLabelsFit({ ys: series.map((line) => y(line.values.at(-1) ?? 0)), minGap: LINE.minLabelGap });

  const box = plotBox({ width, height, tickLabels: ticks.map(formatTick), rightGap: hasEndLabels ? labelRoom : undefined });
  const x = (index: number) => (count > 1 ? box.left + (index * (box.right - box.left)) / (count - 1) : (box.left + box.right) / 2);

  return {
    box,
    ticks,
    hasEndLabels,
    x,
    y,
    paths: series.map((line) => linePath(line.values.map((value, index): LinePoint => [x(index), y(value)])))
  };
};
