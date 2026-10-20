import { describe, expect, it } from 'vitest';

import { nameFromEmail } from '../name-from-email';
import { NAME } from '../name-from-email.constants';

describe('nameFromEmail', () => {
  it('takes the part before the at sign', () => {
    expect(nameFromEmail(' alex.gnome@example.com ')).toBe('alex.gnome');
  });

  it('falls back to the whole address when the local part is too short for a name', () => {
    expect(nameFromEmail('a@example.com')).toBe('a@example.com');
  });

  it('never exceeds the name limit', () => {
    expect(nameFromEmail(`${'x'.repeat(60)}@example.com`)).toHaveLength(NAME.maxLength);
    expect(nameFromEmail(`a@${'y'.repeat(60)}.com`)).toHaveLength(NAME.maxLength);
  });
});
