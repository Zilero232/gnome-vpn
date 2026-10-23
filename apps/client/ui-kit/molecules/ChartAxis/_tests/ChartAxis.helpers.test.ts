import { describe, expect, it } from 'vitest';

import { CHART_AXIS } from '../ChartAxis.constants';
import { clampLabel, labelStride, nearestIndex, niceTicks, scaleY, shownLabels, textWidth, xAxisLabels } from '../ChartAxis.helpers';

const NICE_MANTISSAS = [1, 2, 2.5, 5];

const mantissa = (value: number) => Number((value / 10 ** Math.floor(Math.log10(value))).toPrecision(6));

describe('niceTicks', () => {
  it.each([7, 42, 101, 999, 1234, 0.4, 87_650])('covers %d from zero in even, round steps', (max) => {
    const ticks = niceTicks({ max, count: CHART_AXIS.tickCount });
    const step = ticks[1] - ticks[0];

    expect(ticks[0]).toBe(0);
    expect(ticks.at(-1)).toBeGreaterThanOrEqual(max);
    expect(ticks.length - 1).toBeLessThanOrEqual(CHART_AXIS.tickCount);
    expect(ticks.every((tick, index) => Math.abs(tick - index * step) < step * 1e-9)).toBe(true);
    expect(NICE_MANTISSAS).toContain(mantissa(step));
  });

  it('still draws a scale for an empty series', () => {
    const ticks = niceTicks({ max: 0, count: CHART_AXIS.tickCount });

    expect(ticks.length).toBeGreaterThan(1);
    expect(ticks.at(-1)).toBeGreaterThan(0);
  });
});

describe('labelStride', () => {
  it.each([
    [30, 300],
    [90, 300],
    [30, 1000],
    [90, 1000],
    [7, 300]
  ])('fits %d labels into %dpx without overlap', (count, width) => {
    const labelWidth = 34;
    const stride = labelStride({ count, width, labelWidth });
    const shown = shownLabels({ count, stride }).length;

    expect(shown * (labelWidth + CHART_AXIS.labelGap)).toBeLessThanOrEqual(Math.max(width, labelWidth + CHART_AXIS.labelGap));
  });

  it('never thins a series that already fits', () => {
    expect(labelStride({ count: 5, width: 1000, labelWidth: 30 })).toBe(1);
  });
});

describe('shownLabels', () => {
  it('always keeps the latest label and spaces the rest by the stride', () => {
    const shown = shownLabels({ count: 30, stride: 4 });

    expect(shown.at(-1)).toBe(29);
    expect(shown.slice(1).every((index, position) => index - shown[position] === 4)).toBe(true);
  });
});

describe('scaleY', () => {
  const y = scaleY({ max: 100, top: 10, bottom: 210 });

  it('maps zero to the baseline and the maximum to the top', () => {
    expect(y(0)).toBe(210);
    expect(y(100)).toBe(10);
  });

  it('puts a larger value higher', () => {
    expect(y(70)).toBeLessThan(y(30));
  });

  it('keeps everything on the baseline when there is nothing to scale', () => {
    expect(scaleY({ max: 0, top: 10, bottom: 210 })(5)).toBe(210);
  });
});

describe('nearestIndex', () => {
  const span = { count: 10, start: 40, end: 400 };

  it('snaps the edges to the first and last point', () => {
    expect(nearestIndex({ ...span, x: 40 })).toBe(0);
    expect(nearestIndex({ ...span, x: 400 })).toBe(9);
  });

  it('clamps a pointer outside the plot', () => {
    expect(nearestIndex({ ...span, x: -100 })).toBe(0);
    expect(nearestIndex({ ...span, x: 9999 })).toBe(9);
  });

  it('moves forward as the pointer does', () => {
    expect(nearestIndex({ ...span, x: 300 })).toBeGreaterThan(nearestIndex({ ...span, x: 150 }));
  });
});

describe('clampLabel', () => {
  const box = { left: 30, right: 330, top: 18, bottom: 200 };

  it('keeps a label wholly inside the plot', () => {
    expect(clampLabel({ x: 0, half: 20, box })).toBe(box.left + 20);
    expect(clampLabel({ x: 999, half: 20, box })).toBe(box.right - 20);
  });

  it('leaves a label that already fits where it is', () => {
    expect(clampLabel({ x: 180, half: 20, box })).toBe(180);
  });
});

describe('xAxisLabels', () => {
  const box = { left: 40, right: 340, top: 18, bottom: 200 };
  const labels = Array.from({ length: 90 }, (_, index) => `${index + 1} окт.`);
  const at = (index: number) => box.left + ((index + 0.5) * (box.right - box.left)) / labels.length;

  it('keeps every shown label inside the plot and in order', () => {
    const shown = xAxisLabels({ labels, box, at });

    expect(shown.every(({ x }) => x >= box.left && x <= box.right)).toBe(true);
    expect(shown.slice(1).every(({ x }, index) => x > shown[index].x)).toBe(true);
  });

  it('leaves at least a label gap between neighbours', () => {
    const shown = xAxisLabels({ labels, box, at });
    const width = Math.max(...labels.map(textWidth));

    expect(shown.slice(1).every(({ x }, index) => x - shown[index].x >= width)).toBe(true);
  });

  it('always shows the latest day', () => {
    expect(xAxisLabels({ labels, box, at }).at(-1)?.text).toBe(labels.at(-1));
  });
});
