import { describe, expect, it } from 'vitest';

import { addressOf, hostOf, hostRoute } from '../wireguard.helpers';

describe('hostOf', () => {
  it('drops the mask the panel stores with an address', () => {
    expect(hostOf('10.9.0.7/32')).toBe('10.9.0.7');
  });

  it('leaves a bare address as it is', () => {
    expect(hostOf('10.9.0.7')).toBe('10.9.0.7');
  });
});

describe('hostRoute', () => {
  it('always sends a single-host route, since a wider one would capture other clients', () => {
    expect(hostRoute('10.9.0.7')).toBe('10.9.0.7/32');
    expect(hostRoute('10.9.0.7/24')).toBe('10.9.0.7/32');
  });
});

describe('addressOf', () => {
  it('reads the first allowed address of a client', () => {
    expect(addressOf({ email: 'a', allowedIPs: ['10.9.0.7/32', 'fd00::7/128'] })).toBe('10.9.0.7');
  });

  it('answers null for a client the panel has not addressed', () => {
    expect(addressOf({ email: 'a' })).toBeNull();
    expect(addressOf(undefined)).toBeNull();
  });
});
