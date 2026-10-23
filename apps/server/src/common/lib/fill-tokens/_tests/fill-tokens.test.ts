import { describe, expect, it } from 'vitest';

import { fillTokens } from '../fill-tokens';

describe('fillTokens', () => {
  it('replaces every occurrence of a token and leaves the rest', () => {
    expect(fillTokens({ text: '{date} and {date}, {amount}', fill: { date: 'x' } })).toBe('x and x, {amount}');
  });

  it('puts a value in verbatim even when it looks like a replacement pattern', () => {
    for (const value of ["$'", '$&', '$`', '$$', '$1']) {
      expect(fillTokens({ text: 'paid {amount}', fill: { amount: value } })).toBe(`paid ${value}`);
    }
  });
});
