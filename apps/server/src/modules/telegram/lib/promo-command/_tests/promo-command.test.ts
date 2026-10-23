import { isValid } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { parsePromoCommand } from '../promo-command';

describe('parsePromoCommand', () => {
  it('lists the codes when the command comes alone', () => {
    expect(parsePromoCommand('')).toEqual({ action: 'list' });
    expect(parsePromoCommand('   ')).toEqual({ action: 'list' });
  });

  it('stops exactly one code, in any case of the keyword', () => {
    expect(parsePromoCommand('off blogger20')).toEqual({ action: 'stop', code: 'blogger20' });
    expect(parsePromoCommand('OFF BLOGGER20')).toEqual({ action: 'stop', code: 'BLOGGER20' });
    expect(parsePromoCommand('off')).toEqual({ action: 'unknown' });
    expect(parsePromoCommand('off ONE TWO')).toEqual({ action: 'unknown' });
  });

  it('reads a percent as a discount and a day count as bonus days', () => {
    expect(parsePromoCommand('BLOGGER20 20%')).toEqual({
      action: 'create',
      input: { code: 'BLOGGER20', kind: 'discount', percent: 20, maxUses: null, expiresAt: null }
    });

    expect(parsePromoCommand('WELCOME 7d')).toMatchObject({ action: 'create', input: { kind: 'days', days: 7 } });
    expect(parsePromoCommand('WELCOME +7D')).toMatchObject({ action: 'create', input: { kind: 'days', days: 7 } });
  });

  it('takes the limits in any order, ending the day in Moscow', () => {
    const command = parsePromoCommand('SPRING until=2026-12-31 15% uses=100');

    expect(command).toEqual({
      action: 'create',
      input: { code: 'SPRING', kind: 'discount', percent: 15, maxUses: 100, expiresAt: new Date('2026-12-31T20:59:59.000Z') }
    });
  });

  it('hands an impossible date on as an invalid one, so validation names it rather than rolling it into March', () => {
    const command = parsePromoCommand('SPRING 15% until=2026-02-30');

    expect(command.action).toBe('create');
    expect(command.action === 'create' && command.input.expiresAt && isValid(command.input.expiresAt)).toBe(false);
  });

  it('refuses a command without an effect, with two effects or with a word it does not know', () => {
    expect(parsePromoCommand('SPRING')).toEqual({ action: 'unknown' });
    expect(parsePromoCommand('SPRING uses=5')).toEqual({ action: 'unknown' });
    expect(parsePromoCommand('SPRING 15% 7d')).toEqual({ action: 'unknown' });
    expect(parsePromoCommand('SPRING 15% forever')).toEqual({ action: 'unknown' });
  });
});
