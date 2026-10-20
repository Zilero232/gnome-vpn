import { describe, expect, it } from 'vitest';

import { passwordStrength } from '../password-strength';

describe('passwordStrength', () => {
  it('calls anything under eight characters weak', () => {
    expect(passwordStrength('Ab1!x')).toBe('weak');
  });

  it('calls a long one-class password weak until it is very long', () => {
    expect(passwordStrength('abcdefghij')).toBe('weak');
    expect(passwordStrength('abcdefghijklmn')).toBe('fair');
  });

  it('calls a mixed password fair, and a long mixed one strong', () => {
    expect(passwordStrength('gnome2026')).toBe('fair');
    expect(passwordStrength('Гном-сторож-2026')).toBe('strong');
  });
});
