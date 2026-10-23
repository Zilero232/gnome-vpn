import type { LineLayout, LineSeries } from '../../LineChart.types';

export type LineCrosshairProps = {
  series: LineSeries[];
  layout: LineLayout;
  active: number;
};
