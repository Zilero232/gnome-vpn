import { describe, expect, it } from 'vitest';

import type { ConsentRow } from '../consent-state.types';

import { consentState } from '../consent-state';

const at = (iso: string) => new Date(iso);

const row = (patch: Partial<ConsentRow>): ConsentRow => ({
  kind: 'marketing',
  version: '2026-10-24',
  granted: true,
  createdAt: at('2026-10-24T10:00:00.000Z'),
  ...patch
});

describe('consentState', () => {
  it('reads an account with no records as having consented to nothing', () => {
    expect(consentState([])).toEqual({ personalData: null, marketing: null });
  });

  it('takes the latest row of each kind as the current state, whatever order the rows came in', () => {
    const state = consentState([
      row({ granted: false, createdAt: at('2026-10-25T10:00:00.000Z') }),
      row({ granted: true }),
      row({ kind: 'personalData', version: '2026-10-24' })
    ]);

    expect(state.marketing).toEqual({ granted: false, at: '2026-10-25T10:00:00.000Z' });
    expect(state.personalData).toEqual({ granted: true, version: '2026-10-24', at: '2026-10-24T10:00:00.000Z' });
  });

  it('names the version of the personal-data text the account last agreed to', () => {
    const state = consentState([
      row({ kind: 'personalData', version: '2026-10-24' }),
      row({ kind: 'personalData', version: '2027-01-10', createdAt: at('2027-01-10T08:00:00.000Z') })
    ]);

    expect(state.personalData?.version).toBe('2027-01-10');
  });
});
