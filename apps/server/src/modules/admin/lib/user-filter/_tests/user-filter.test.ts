import type { AdminUserFilter } from '@gnomevpn/schemas';

import { ADMIN_PERIOD_DAYS, ADMIN_USER_FILTERS, PLACEHOLDER_EMAIL } from '@gnomevpn/schemas';
import { subDays } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { needsTrialUserIds, userFilterWhere } from '../user-filter';

const NOW = new Date('2026-10-23T12:00:00.000Z');
const TRIAL_USER_IDS = ['trial-1', 'trial-2'];
const NO_FILTER: AdminUserFilter = { period: ADMIN_USER_FILTERS.defaultPeriod };

const where = (filter: Partial<AdminUserFilter>) => userFilterWhere({ filter: { ...NO_FILTER, ...filter }, now: NOW, trialUserIds: TRIAL_USER_IDS });

describe('userFilterWhere', () => {
  it('adds nothing when no filter is set', () => {
    expect(where({})).toEqual([]);
    expect(needsTrialUserIds(NO_FILTER)).toBe(false);
  });

  it('finds people on a free day by id and keeps them out of paid access', () => {
    expect(where({ access: 'trial' })).toEqual([{ id: { in: TRIAL_USER_IDS } }]);
    expect(where({ access: 'paid' })).toEqual([{ subscription: { is: { currentPeriodEnd: { gt: NOW } } }, id: { notIn: TRIAL_USER_IDS } }]);
  });

  it('counts an account with no subscription row as having no access', () => {
    expect(where({ access: 'none' })).toEqual([
      { OR: [{ subscription: { is: null } }, { subscription: { is: { OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { lte: NOW } }] } } }] }
    ]);
  });

  it('reads a plan and auto-renewal as filters over paid access only', () => {
    for (const filter of [{ plan: 'yearly' }, { autoRenew: 'on' }, { autoRenew: 'off' }] as const) {
      expect(where(filter)[0]).toMatchObject({ id: { notIn: TRIAL_USER_IDS }, subscription: { is: { currentPeriodEnd: { gt: NOW } } } });
      expect(needsTrialUserIds({ ...NO_FILTER, ...filter })).toBe(true);
    }
  });

  it('tells a Telegram-only account from an unconfirmed email', () => {
    expect(where({ email: 'none' })).toEqual([{ email: { endsWith: PLACEHOLDER_EMAIL.domain, mode: 'insensitive' } }]);
    expect(where({ email: 'unverified' })[0]).toMatchObject({ emailVerified: false, NOT: { email: { endsWith: PLACEHOLDER_EMAIL.domain } } });
  });

  it('counts the sign-up period back from now', () => {
    expect(where({ period: '30d' })).toEqual([{ createdAt: { gte: subDays(NOW, ADMIN_PERIOD_DAYS['30d']) } }]);
  });

  it('joins several filters so each narrows the list', () => {
    expect(where({ access: 'paid', telegram: 'linked', period: '7d' })).toHaveLength(3);
  });
});
