import { describe, expect, it } from 'vitest';

import { pageWindow } from '../page-window';

const SIZE = 25;

describe('pageWindow', () => {
  it('skips the rows of every page before the one asked for', () => {
    const window = pageWindow({ page: 3, total: SIZE * 10, size: SIZE });

    expect(window.skip).toBe((window.page - 1) * SIZE);
    expect(window.take).toBe(SIZE);
  });

  it('counts a partly filled last page as a page', () => {
    expect(pageWindow({ page: 1, total: SIZE * 2 + 1, size: SIZE }).pages).toBe(3);
  });

  it('keeps one page for an empty result, so page 1 always exists', () => {
    const window = pageWindow({ page: 1, total: 0, size: SIZE });

    expect([window.page, window.pages, window.skip]).toEqual([1, 1, 0]);
  });

  it('moves a page past the end back to the last page', () => {
    const window = pageWindow({ page: 99, total: SIZE * 2, size: SIZE });

    expect(window.page).toBe(window.pages);
    expect(window.skip).toBeLessThan(window.total);
  });

  it('never goes below the first page', () => {
    expect(pageWindow({ page: 0, total: SIZE, size: SIZE }).page).toBe(1);
  });
});
