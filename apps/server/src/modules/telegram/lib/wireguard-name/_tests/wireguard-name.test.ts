import { describe, expect, it } from 'vitest';

import { wireguardName } from '../wireguard-name';

describe('wireguardName', () => {
  it('keeps the plain name while it is free', () => {
    expect(wireguardName({ base: 'Phone', taken: ['Laptop'] })).toBe('Phone');
  });

  it('numbers a name that is already taken, starting from two', () => {
    expect(wireguardName({ base: 'Phone', taken: ['Phone'] })).toBe('Phone 2');
  });

  it('skips the numbers already in use', () => {
    expect(wireguardName({ base: 'Phone', taken: ['Phone', 'Phone 2', 'Phone 3'] })).toBe('Phone 4');
  });

  it('fills the first gap rather than counting past it', () => {
    expect(wireguardName({ base: 'Phone', taken: ['Phone', 'Phone 3'] })).toBe('Phone 2');
  });
});
