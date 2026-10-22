import { describe, expect, it } from 'vitest';

import { countryFlag } from '../country-flag';

describe('countryFlag', () => {
  it('turns a two-letter code into its regional-indicator flag', () => {
    expect(countryFlag('NL')).toBe('🇳🇱');
  });

  it('reads the code regardless of case and stray spaces', () => {
    expect(countryFlag(' fi ')).toBe(countryFlag('FI'));
  });

  it('gives nothing for a code that is not two letters', () => {
    expect(countryFlag('')).toBe('');
    expect(countryFlag('NLD')).toBe('');
    expect(countryFlag('N1')).toBe('');
  });
});
