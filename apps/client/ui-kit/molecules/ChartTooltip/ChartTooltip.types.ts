import type { ReactNode } from 'react';

export type ChartTooltipSide = 'left' | 'right';

export type ChartTooltipRow = {
  key: string;
  value: string;
  label?: string;
  slot?: 1 | 2 | 3;
};

export type ChartTooltipProps = {
  x: number;
  top: number;
  title: ReactNode;
  rows: ChartTooltipRow[];
  side: ChartTooltipSide;
};
