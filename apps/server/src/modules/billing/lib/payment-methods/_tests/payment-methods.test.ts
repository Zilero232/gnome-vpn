import { PAYMENT_METHODS } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { YOOKASSA_METHODS } from '../../../config';
import { offeredMethods } from '../payment-methods';

describe('offeredMethods', () => {
  it('names every method YooKassa reports that we have a name for', () => {
    expect(offeredMethods(Object.keys(YOOKASSA_METHODS))).toEqual(PAYMENT_METHODS);
  });

  it('keeps our display order whatever order YooKassa answers in, and drops methods we do not show', () => {
    expect(offeredMethods(['cash', 'sbp', 'mobile_balance', 'bank_card'])).toEqual(['card', 'sbp']);
  });

  it('reports nothing for a shop with nothing we can name, so the caller decides the fallback', () => {
    expect(offeredMethods([])).toEqual([]);
    expect(offeredMethods(['cash'])).toEqual([]);
  });
});
