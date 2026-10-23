import type { ColumnLayout, ColumnPoint } from '../../ColumnChart.types';

export type ColumnHitsProps = {
  points: ColumnPoint[];
  layout: ColumnLayout;
  formatValue: (value: number) => string;
  onActive: (index: number | null) => void;
};
