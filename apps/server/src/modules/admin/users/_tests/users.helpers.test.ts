import type { AdminUserFilter } from '@gnomevpn/schemas';

import { ADMIN_PERIOD_DAYS, ADMIN_USER_FILTERS, adminUserSchema, PLACEHOLDER_EMAIL, telegramPlaceholderEmail } from '@gnomevpn/schemas';
import { addDays, subDays } from 'date-fns';
import { describe, expect, it } from 'vitest';

import type { UserRow } from '../users.types';

import { USER_SEARCH } from '../users.config';
import { needsTrialUserIds, parseUserSearch, userFilterWhere, userSearchWhere, userView } from '../users.helpers';

const NOW = new Date('2026-10-23T12:00:00.000Z');

const USER_ID = '3f2b9c4e-8a1d-4c6b-9e7f-0a1b2c3d4e5f';

describe('parseUserSearch', () => {
  it('lists everyone for an empty or blank query', () => {
    expect(parseUserSearch('')).toEqual({ kind: 'all' });
    expect(parseUserSearch('   ')).toEqual({ kind: 'all' });
  });

  it('reads a uuid as a user id, whatever its case', () => {
    expect(parseUserSearch(` ${USER_ID.toUpperCase()} `)).toEqual({ kind: 'userId', id: USER_ID });
  });

  it('reads digits as a telegram id', () => {
    expect(parseUserSearch('123456789')).toEqual({ kind: 'telegramId', id: '123456789' });
  });

  it('falls back to text for digits a telegram id column cannot hold', () => {
    const tooLarge = (USER_SEARCH.maxTelegramId + 1n).toString();

    expect(parseUserSearch(tooLarge).kind).toBe('text');
  });

  it('reads @name as a telegram username without the at sign', () => {
    expect(parseUserSearch('@gnome_fan')).toEqual({ kind: 'username', username: 'gnome_fan' });
  });

  it('keeps a lone at sign as text rather than an empty username', () => {
    expect(parseUserSearch('@').kind).toBe('text');
  });

  it('treats anything else as text', () => {
    expect(parseUserSearch('ivan@mail')).toEqual({ kind: 'text', text: 'ivan@mail' });
  });
});

describe('userSearchWhere', () => {
  it('filters nothing for the full list', () => {
    expect(userSearchWhere({ kind: 'all' })).toEqual({});
  });

  it('matches text against the email, the name and the telegram username, ignoring case', () => {
    const where = userSearchWhere({ kind: 'text', text: 'ivan' });
    const conditions = JSON.stringify(where.OR);

    expect(where.OR).toHaveLength(4);
    expect(conditions).toContain('insensitive');
    expect(conditions).toContain('email');
    expect(conditions).toContain('telegramAccount');
  });

  it('finds a user by the id better-auth issued, exactly as written', () => {
    const id = 'dsZGjcbWa0MX2hkqdH6jkSsUFFq5OLfz';

    expect(userSearchWhere(parseUserSearch(id)).OR).toContainEqual({ id });
  });

  it('compares a telegram id as a bigint', () => {
    const where = userSearchWhere({ kind: 'telegramId', id: '42' });

    expect(where.OR?.[0]).toEqual({ telegramAccount: { telegramId: 42n } });
  });
});

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

const user = (patch: Partial<UserRow> = {}): UserRow => ({
  id: 'user-1',
  email: 'reader@example.com',
  emailVerified: true,
  createdAt: NOW,
  subscription: null,
  telegramAccount: null,
  _count: { devices: 2 },
  ...patch
});

describe('userView', () => {
  it('reads an account with no subscription row as having no access', () => {
    const view = userView(user());

    expect([view.access, view.plan, view.currentPeriodEnd]).toEqual(['none', null, null]);
    expect(adminUserSchema.parse(view)).toEqual(view);
  });

  it('says a bot-born account has no real email', () => {
    expect(userView(user({ email: telegramPlaceholderEmail(42n) })).hasEmail).toBe(false);
  });

  it('carries the telegram id as a string, since JSON has no bigint', () => {
    const view = userView(user({ telegramAccount: { telegramId: 123_456_789_012n, username: null } }));

    expect(view.telegram).toEqual({ id: '123456789012', username: null });
  });

  it('reports a live paid period as paid', () => {
    const view = userView(user({ subscription: { plan: 'yearly', currentPeriodEnd: addDays(new Date(), 30), trialStartedAt: null } }));

    expect(view.access).toBe('paid');
  });
});
