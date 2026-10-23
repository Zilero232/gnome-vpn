import { range } from 'remeda';

import type {
  AxisLabel,
  AxisLabelsInput,
  ClampLabelInput,
  LabelStrideInput,
  NearestIndexInput,
  NiceTicksInput,
  PlotBox,
  PlotBoxInput,
  ScaleInput,
  ShownLabelsInput
} from './ChartAxis.types';

import { CHART_AXIS } from './ChartAxis.constants';

export const textWidth = (text: string): number => text.length * CHART_AXIS.fontSize * CHART_AXIS.charWidth;

export const niceTicks = ({ max, count }: NiceTicksInput): number[] => {
  const top = max > 0 ? max : 1;
  const rough = top / Math.max(count, 1);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = (CHART_AXIS.tickSteps.find((candidate) => candidate * magnitude >= rough) ?? 10) * magnitude;
  const steps = Math.ceil(top / step);

  return range(0, steps + 1).map((index) => Number((index * step).toPrecision(12)));
};

export const labelStride = ({ count, width, labelWidth }: LabelStrideInput): number => {
  if (count <= 0 || width <= 0) {
    return 1;
  }

  const fits = Math.max(Math.floor(width / (labelWidth + CHART_AXIS.labelGap)), 1);

  return Math.max(Math.ceil(count / fits), 1);
};

export const shownLabels = ({ count, stride }: ShownLabelsInput): number[] => range(0, count).filter((index) => (count - 1 - index) % stride === 0);

export const scaleY =
  ({ max, top, bottom }: ScaleInput) =>
  (value: number): number =>
    max > 0 ? bottom - (Math.max(value, 0) / max) * (bottom - top) : bottom;

export const plotBox = ({ width, height, tickLabels, rightGap = CHART_AXIS.rightGap }: PlotBoxInput): PlotBox => ({
  left: Math.ceil(Math.max(...tickLabels.map(textWidth), 0)) + CHART_AXIS.tickGap,
  right: width - rightGap,
  top: CHART_AXIS.topGap,
  bottom: height
});

export const nearestIndex = ({ x, count, start, end }: NearestIndexInput): number => {
  if (count <= 1 || end <= start) {
    return 0;
  }

  const ratio = (x - start) / (end - start);

  return Math.min(Math.max(Math.round(ratio * (count - 1)), 0), count - 1);
};

export const clampLabel = ({ x, half, box }: ClampLabelInput): number => Math.min(Math.max(x, box.left + half), box.right - half);

export const xAxisLabels = ({ labels, box, at }: AxisLabelsInput): AxisLabel[] => {
  const labelWidth = Math.max(...labels.map(textWidth), 0);
  const spacing = labelWidth + CHART_AXIS.labelGap;
  const stride = labelStride({ count: labels.length, width: box.right - box.left, labelWidth });

  const placed = shownLabels({ count: labels.length, stride }).map((index) => ({
    key: `${index}`,
    x: clampLabel({ x: at(index), half: labelWidth / 2, box }),
    text: labels[index]
  }));

  return placed.reduceRight<AxisLabel[]>((kept, label) => {
    const next = kept.at(0);

    return !next || next.x - label.x >= spacing ? [label, ...kept] : kept;
  }, []);
};
