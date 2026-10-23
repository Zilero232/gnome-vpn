import type { SparklineGeometry, SparklinePoint } from './Sparkline.types';

import { SPARKLINE } from './Sparkline.constants';

const toPoints = (values: number[]): SparklinePoint[] => {
  const low = Math.min(0, ...values);
  const span = Math.max(...values, low) - low;
  const step = values.length > 1 ? SPARKLINE.width / (values.length - 1) : 0;
  const plot = SPARKLINE.height - SPARKLINE.pad * 2;

  return values.map((value, index) => ({
    x: values.length > 1 ? index * step : SPARKLINE.width / 2,
    y: SPARKLINE.pad + (span > 0 ? (1 - (value - low) / span) * plot : plot)
  }));
};

export const sparklineGeometry = (values: number[]): SparklineGeometry => {
  const points = toPoints(values);

  return {
    path: points.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' '),
    end: points.at(-1) ?? null
  };
};
