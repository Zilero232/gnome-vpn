import { describe, expect, it } from 'vitest';

import { serverName } from '../server-name';

describe('serverName', () => {
  it('prefixes the country with its flag and names nothing finer, such as the city', () => {
    expect(serverName({ country: 'Netherlands', countryCode: 'NL' })).toBe('🇳🇱 Netherlands');
  });

  it('falls back to the plain country when the code is not two letters', () => {
    expect(serverName({ country: 'Netherlands', countryCode: '' })).toBe('Netherlands');
  });
});
