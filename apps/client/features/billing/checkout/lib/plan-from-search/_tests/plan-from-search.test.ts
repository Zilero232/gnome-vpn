import { describe, expect, it } from 'vitest';

import { planFromSearch } from '../plan-from-search';

describe('planFromSearch', () => {
  it('reads the plan the pricing page passed on', () => {
    expect(planFromSearch('?plan=yearly')).toBe('yearly');
  });

  it('ignores a plan that does not exist', () => {
    expect(planFromSearch('?plan=lifetime')).toBeNull();
  });

  it('answers nothing when no plan was passed', () => {
    expect(planFromSearch('')).toBeNull();
  });
});
