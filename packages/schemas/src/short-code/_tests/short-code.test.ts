import { describe, expect, it } from 'vitest';

import { isShortCode, normaliseShortCode } from '../short-code';
import { SHORT_CODE } from '../short-code.constants';

describe('SHORT_CODE', () => {
  it('leaves out the glyphs a reader confuses, which is what makes the code retypable at all', () => {
    for (const ambiguous of ['0', 'O', '1', 'I', 'L']) {
      expect(SHORT_CODE.alphabet).not.toContain(ambiguous);
    }
  });
});

describe('normaliseShortCode', () => {
  it('accepts the code however the sender capitalised it', () => {
    expect(normaliseShortCode('abc23xyz')).toBe('ABC23XYZ');
  });

  it('forgives the whitespace a chat client adds around a pasted code', () => {
    expect(normaliseShortCode('  ABC23XYZ  ')).toBe('ABC23XYZ');
    expect(normaliseShortCode('ABC2 3XYZ')).toBe('ABC23XYZ');
  });
});

describe('isShortCode', () => {
  it('accepts the code the way a person types it', () => {
    expect(isShortCode(' abc23xyz ')).toBe(true);
  });

  it('refuses ordinary chat, so a stray message never reaches the database', () => {
    expect(isShortCode('hello')).toBe(false);
    expect(isShortCode('привет')).toBe(false);
    expect(isShortCode('')).toBe(false);
    expect(isShortCode('ABCD234')).toBe(false);
    expect(isShortCode('ABCD23456')).toBe(false);
  });

  it('refuses the characters the alphabet leaves out', () => {
    expect(isShortCode('ABCD0123')).toBe(false);
    expect(isShortCode('ABCDIOL1')).toBe(false);
  });
});
