import { adminUserCardSchema } from '@gnomevpn/schemas';
import { addDays } from 'date-fns';
import { assert, describe, expect, it } from 'vitest';

import type { CardUserRow, UserCardInput } from '../users.types';

import { userCard } from '../user-card.helpers';

const NOW = new Date('2026-10-23T12:00:00.000Z');
const CARD_ID = 'pm-secret-card-id';

const SUBSCRIPTION: NonNullable<CardUserRow['subscription']> = {
  plan: 'monthly',
  currentPeriodEnd: addDays(new Date(), 10),
  cancelAtPeriodEnd: false,
  savedCardId: CARD_ID,
  savedCardTitle: 'Visa •• 4242',
  extraDevices: 0,
  bonusDays: 0,
  trialStartedAt: null
};

const user = (patch: Partial<CardUserRow> = {}): CardUserRow => ({
  id: 'user-1',
  email: 'reader@example.com',
  name: 'Reader',
  emailVerified: true,
  locale: 'ru',
  createdAt: NOW,
  telegramAccount: null,
  subscription: SUBSCRIPTION,
  subscriptionLink: null,
  referralCode: null,
  referredBy: null,
  ...patch
});

const input = (patch: Partial<UserCardInput> = {}): UserCardInput => ({
  user: user(),
  devices: { devices: [], deviceLimit: 3 },
  payments: [],
  invited: [],
  invitedTotal: 0,
  redemptions: [],
  gifts: [],
  now: NOW,
  ...patch
});

describe('userCard', () => {
  it('never carries the saved card id, only its title', () => {
    const card = adminUserCardSchema.parse(userCard(input()));

    expect(JSON.stringify(card)).not.toContain(CARD_ID);
    expect(card.subscription?.savedCardTitle).toBe('Visa •• 4242');
  });

  it('calls renewal on only with a card on file and renewal not turned off', () => {
    const on = userCard(input());
    const off = userCard(input({ user: user({ subscription: { ...SUBSCRIPTION, cancelAtPeriodEnd: true } }) }));
    const cardless = userCard(input({ user: user({ subscription: { ...SUBSCRIPTION, savedCardId: null } }) }));

    expect([on.subscription?.isAutoRenewOn, off.subscription?.isAutoRenewOn, cardless.subscription?.isAutoRenewOn]).toEqual([true, false, false]);
  });

  it('shows a gift code redeemed by this account masked', () => {
    const code = 'ABCDEFGHJKMN';
    const card = userCard(
      input({ redemptions: [{ createdAt: NOW, consumedAt: null, replacedAt: null, promoCode: { code, kind: 'gift', percent: null, days: 30 } }] })
    );

    const [redemption] = card.redemptions;

    assert(redemption);
    expect(redemption.code.replaceAll('-', '')).not.toBe(code);
  });

  it('leaves out the other side of a referral whose account was deleted, since there is nobody to link to', () => {
    const gone = { createdAt: NOW, rewardedAt: NOW, referrerDays: 7, referred: null };
    const live = { ...gone, referred: { id: 'friend-1', email: 'friend@example.com' } };
    const card = userCard(
      input({ user: user({ referredBy: { createdAt: NOW, rewardedAt: null, friendDays: 0, referrer: null } }), invited: [gone, live] })
    );

    expect(card.referral.referredBy).toBeNull();
    expect(card.referral.invited.map((referral) => referral.user.id)).toEqual(['friend-1']);
    expect(adminUserCardSchema.parse(card)).toEqual(card);
  });

  it('passes the contract with no subscription and no telegram', () => {
    const card = userCard(input({ user: user({ subscription: null }) }));

    expect(adminUserCardSchema.parse(card)).toEqual(card);
  });
});
