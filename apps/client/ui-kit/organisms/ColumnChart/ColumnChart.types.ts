import type { PlotBox } from '../../molecules';

export type ColumnPoint = {
  key: string;
  label: string;
  value: number;
};

export type ColumnChartProps = {
  points: ColumnPoint[];
  formatValue: (value: number) => string;
  formatTick?: (value: number) => string;
  label: string;
  height?: number;
  className?: string;
};

export type ColumnLayoutInput = {
  values: number[];
  width: number;
  height: number;
  formatTick: (value: number) => string;
};

export type ColumnLayout = {
  box: PlotBox;
  ticks: number[];
  band: number;
  barWidth: number;
  y: (value: number) => number;
  left: (index: number) => number;
  center: (index: number) => number;
};

export type ColumnPathInput = {
  x: number;
  y: number;
  width: number;
  base: number;
};
