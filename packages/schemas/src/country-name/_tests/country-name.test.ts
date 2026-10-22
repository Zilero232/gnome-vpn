import { describe, expect, it } from 'vitest';

import { countryName } from '../country-name';

describe('countryName', () => {
  it('names the country in the reader language rather than the server one', () => {
    expect(countryName({ locale: 'ru', countryCode: 'NL', fallback: 'Netherlands' })).toBe('Нидерланды');
    expect(countryName({ locale: 'en', countryCode: 'nl', fallback: 'Netherlands' })).toBe('Netherlands');
  });

  it('falls back to the name the server sent when the code is not a region', () => {
    expect(countryName({ locale: 'ru', countryCode: 'not-a-code', fallback: 'Somewhere' })).toBe('Somewhere');
  });
});
