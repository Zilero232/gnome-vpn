import type { PlotBox } from '../../molecules';

export type LineSeries = {
  key: string;
  label: string;
  values: number[];
};

export type LineChartProps = {
  labels: string[];
  series: LineSeries[];
  formatValue: (value: number) => string;
  formatTick?: (value: number) => string;
  label: string;
  height?: number;
  className?: string;
};

export type LineLayoutInput = {
  series: LineSeries[];
  count: number;
  width: number;
  height: number;
  formatTick: (value: number) => string;
};

export type LineLayout = {
  box: PlotBox;
  ticks: number[];
  paths: string[];
  hasEndLabels: boolean;
  x: (index: number) => number;
  y: (value: number) => number;
};

export type EndLabelsFitInput = {
  ys: number[];
  minGap: number;
};

export type LinePoint = [x: number, y: number];

export type UseLineCursorInput = {
  count: number;
  layout: LineLayout | null;
};
