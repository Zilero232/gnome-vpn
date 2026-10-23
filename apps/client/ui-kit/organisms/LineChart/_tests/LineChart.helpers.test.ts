import { describe, expect, it } from 'vitest';

import { LINE } from '../LineChart.constants';
import { endLabelsFit, lineLayout, linePath } from '../LineChart.helpers';

const formatTick = (value: number) => `${value}`;
const series = [
  { key: 'paid', label: 'Paid', values: [1, 4, 2, 8, 5] },
  { key: 'trials', label: 'Trials', values: [3, 3, 6, 2, 9] }
];

describe('endLabelsFit', () => {
  it('accepts labels that are far enough apart in any order', () => {
    expect(endLabelsFit({ ys: [120, 20, 70], minGap: LINE.minLabelGap })).toBe(true);
  });

  it('refuses labels that would overlap', () => {
    expect(endLabelsFit({ ys: [100, 100 + LINE.minLabelGap - 1], minGap: LINE.minLabelGap })).toBe(false);
  });
});

describe('linePath', () => {
  it('moves to the first point and draws to every other one', () => {
    const path = linePath([
      [0, 10],
      [5, 20],
      [10, 15]
    ]);

    expect(path.startsWith('M')).toBe(true);
    expect(path.split('L')).toHaveLength(3);
  });
});

describe('lineLayout', () => {
  it.each([300, 360, 1000])('spreads the points across the plot at %dpx', (width) => {
    const layout = lineLayout({ series, count: 5, width, height: 200, formatTick });

    expect(layout.x(0)).toBe(layout.box.left);
    expect(layout.x(4)).toBe(layout.box.right);
    expect(layout.paths).toHaveLength(series.length);
  });

  it('labels the line ends only where there is room', () => {
    expect(lineLayout({ series, count: 5, width: 320, height: 200, formatTick }).hasEndLabels).toBe(false);
  });

  it('keeps room for end labels on the right when it shows them', () => {
    const wide = lineLayout({ series, count: 5, width: 1000, height: 200, formatTick });
    const plain = lineLayout({ series: series.slice(0, 1), count: 5, width: 1000, height: 200, formatTick });

    expect(wide.hasEndLabels || plain.hasEndLabels).toBe(true);
    expect(wide.hasEndLabels ? wide.box.right : plain.box.right).toBeLessThan(1000 - LINE.endLabelGap);
  });

  it('puts the largest value at or below the top of the plot', () => {
    const layout = lineLayout({ series, count: 5, width: 640, height: 200, formatTick });

    expect(layout.y(9)).toBeGreaterThanOrEqual(layout.box.top);
  });

  it('centres a single point', () => {
    const layout = lineLayout({ series: [{ key: 'one', label: 'One', values: [3] }], count: 1, width: 400, height: 200, formatTick });

    expect(layout.x(0)).toBe((layout.box.left + layout.box.right) / 2);
  });
});
