import type { ReactNode } from 'react';

export type ChartSlot = 1 | 2 | 3;

export type ChartView = 'chart' | 'table';

export type ChartLegendItem = {
  key: string;
  label: string;
  slot: ChartSlot;
  mark?: 'line' | 'rect';
};

export type ChartTableRow = {
  key: string;
  cells: ReactNode[];
};

export type ChartTable = {
  columns: string[];
  rows: ChartTableRow[];
};

export type ChartFrameLabels = {
  chart: string;
  table: string;
  view: string;
};

export type ChartFrameProps = {
  title: ReactNode;
  summary?: ReactNode;
  legend?: ChartLegendItem[];
  table: ChartTable;
  labels: ChartFrameLabels;
  isFaded?: boolean;
  className?: string;
  children: ReactNode;
};
