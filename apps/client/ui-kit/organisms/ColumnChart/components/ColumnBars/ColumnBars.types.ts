import type { ColumnLayout } from '../../ColumnChart.types';

export type ColumnBarsProps = {
  values: number[];
  layout: ColumnLayout;
  active: number | null;
  formatValue: (value: number) => string;
};
