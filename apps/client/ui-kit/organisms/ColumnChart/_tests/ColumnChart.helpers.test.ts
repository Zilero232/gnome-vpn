import { describe, expect, it } from 'vitest';

import { COLUMN } from '../ColumnChart.constants';
import { columnLayout, columnPath } from '../ColumnChart.helpers';

const formatTick = (value: number) => `${value}`;
const values = Array.from({ length: 30 }, (_, index) => (index * 37) % 11);

describe('columnLayout', () => {
  it.each([300, 360, 640, 1000])('keeps every column inside the plot at %dpx', (width) => {
    const layout = columnLayout({ values, width, height: 200, formatTick });

    expect(layout.left(0)).toBeGreaterThanOrEqual(layout.box.left);
    expect(layout.left(values.length - 1) + layout.barWidth).toBeLessThanOrEqual(layout.box.right + 1e-9);
  });

  it('caps a column at the thin-mark width however wide the chart is', () => {
    expect(columnLayout({ values: [1, 2, 3], width: 1000, height: 200, formatTick }).barWidth).toBe(COLUMN.maxBar);
  });

  it('leaves air between neighbours', () => {
    const layout = columnLayout({ values, width: 640, height: 200, formatTick });

    expect(layout.left(1) - (layout.left(0) + layout.barWidth)).toBeGreaterThan(0);
  });

  it('scales the tallest value within the top tick', () => {
    const layout = columnLayout({ values, width: 640, height: 200, formatTick });

    expect(layout.y(Math.max(...values))).toBeGreaterThanOrEqual(layout.box.top);
  });

  it('still draws 90 days at phone width', () => {
    const layout = columnLayout({ values: Array.from<number>({ length: 90 }).fill(1), width: 300, height: 200, formatTick });

    expect(layout.barWidth).toBeGreaterThan(0);
    expect(layout.band).toBeGreaterThan(layout.barWidth);
  });
});

describe('columnPath', () => {
  it('draws nothing for a zero column', () => {
    expect(columnPath({ x: 10, y: 100, width: 12, base: 100 })).toBe('');
  });

  it('starts and ends on the baseline', () => {
    const path = columnPath({ x: 10, y: 40, width: 12, base: 100 });

    expect(path.startsWith('M10,100')).toBe(true);
    expect(path).toContain('V100 Z');
  });

  it('never rounds more than half the column width', () => {
    const path = columnPath({ x: 0, y: 40, width: 2, base: 100 });

    expect(path).toContain('Q0,40 1,40');
  });
});
