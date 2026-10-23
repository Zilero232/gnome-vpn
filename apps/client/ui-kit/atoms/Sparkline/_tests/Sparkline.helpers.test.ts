import { describe, expect, it } from 'vitest';

import { SPARKLINE } from '../Sparkline.constants';
import { sparklineGeometry } from '../Sparkline.helpers';

const coordinates = (path: string) =>
  path
    .split(' ')
    .map((segment) => segment.slice(1).split(',').map(Number))
    .map(([x, y]) => ({ x, y }));

describe('sparklineGeometry', () => {
  it('spans the full width from the first value to the last', () => {
    const points = coordinates(sparklineGeometry([3, 1, 4, 1, 5]).path);

    expect(points.at(0)?.x).toBe(0);
    expect(points.at(-1)?.x).toBe(SPARKLINE.width);
  });

  it('draws a higher value higher up', () => {
    const [low, high] = coordinates(sparklineGeometry([1, 9]).path);

    expect(high.y).toBeLessThan(low.y);
  });

  it('keeps all-zero data as a flat line inside the box', () => {
    const points = coordinates(sparklineGeometry([0, 0, 0, 0]).path);

    expect(new Set(points.map(({ y }) => y)).size).toBe(1);
    expect(points[0].y).toBeLessThanOrEqual(SPARKLINE.height);
  });

  it('ends on the last value', () => {
    const { path, end } = sparklineGeometry([2, 7, 4]);
    const last = coordinates(path).at(-1);

    expect(end?.x).toBeCloseTo(last?.x ?? Number.NaN, 2);
    expect(end?.y).toBeCloseTo(last?.y ?? Number.NaN, 2);
  });

  it('has no end point without values', () => {
    expect(sparklineGeometry([]).end).toBeNull();
  });
});
