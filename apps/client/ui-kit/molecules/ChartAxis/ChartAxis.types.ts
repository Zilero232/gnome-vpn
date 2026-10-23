export type NiceTicksInput = {
  max: number;
  count: number;
};

export type LabelStrideInput = {
  count: number;
  width: number;
  labelWidth: number;
};

export type ShownLabelsInput = {
  count: number;
  stride: number;
};

export type ScaleInput = {
  max: number;
  top: number;
  bottom: number;
};

export type NearestIndexInput = {
  x: number;
  count: number;
  start: number;
  end: number;
};

export type PlotBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type PlotBoxInput = {
  width: number;
  height: number;
  tickLabels: string[];
  rightGap?: number;
};

export type ClampLabelInput = {
  x: number;
  half: number;
  box: PlotBox;
};

export type AxisLabel = {
  key: string;
  x: number;
  text: string;
};

export type AxisLabelsInput = {
  labels: string[];
  box: PlotBox;
  at: (index: number) => number;
};

export type ChartAxisProps = {
  box: PlotBox;
  ticks: number[];
  y: (value: number) => number;
  formatTick: (value: number) => string;
};

export type ChartXLabelsProps = {
  labels: AxisLabel[];
  y: number;
};
