import { giftDays, PLANS } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import type { GiftPayment } from '../gift.types';

import { GIFT } from '../../../config';
import { giftToIssue, giftView } from '../gift';

const payment = (overrides: Partial<GiftPayment> = {}): GiftPayment => ({
  id: 'payment-1',
  kind: 'gift',
  plan: 'monthly',
  userId: 'buyer-1',
  ...overrides
});

describe('giftToIssue', () => {
  it('drafts one single-use code per gift payment, keyed by that payment', () => {
    const draft = giftToIssue({ payment: payment(), existing: null });

    expect(draft?.paymentId).toBe('payment-1');
    expect(draft?.maxUses).toBe(GIFT.maxUses);
    expect(draft?.buyerId).toBe('buyer-1');
  });

  it('grants the length of the plan that was bought', () => {
    for (const plan of PLANS) {
      expect(giftToIssue({ payment: payment({ plan: plan.id }), existing: null })?.days).toBe(giftDays(plan.id));
    }
  });

  it('issues nothing when the payment already has its gift, so a replayed settlement adds no second code', () => {
    expect(giftToIssue({ payment: payment(), existing: { code: 'ABCDEFGHJKMN' } })).toBeNull();
  });

  it('issues nothing for a payment that is not a gift', () => {
    expect(giftToIssue({ payment: payment({ kind: 'subscription' }), existing: null })).toBeNull();
    expect(giftToIssue({ payment: payment({ kind: 'extraDevices' }), existing: null })).toBeNull();
  });
});

describe('giftView', () => {
  const row = {
    code: 'ABCDEFGHJKMN',
    plan: 'yearly' as const,
    days: giftDays('yearly'),
    createdAt: new Date('2026-10-01T10:00:00.000Z'),
    expiresAt: null,
    redemptions: []
  };

  it('shows an unredeemed gift as such', () => {
    expect(giftView({ row, link: 'https://gnome-vpn.com/?ref=ABCDEFGHJKMN' })?.redeemedAt).toBeNull();
  });

  it('shows when the gift was redeemed', () => {
    const redeemedAt = new Date('2026-10-05T10:00:00.000Z');

    expect(giftView({ row: { ...row, redemptions: [{ createdAt: redeemedAt }] }, link: 'https://gnome-vpn.com/' })?.redeemedAt).toBe(
      redeemedAt.toISOString()
    );
  });

  it('shows a refunded gift as revoked, since a refund is the only thing that gives a gift an expiry', () => {
    const revokedAt = new Date('2026-10-06T10:00:00.000Z');

    expect(giftView({ row, link: 'https://gnome-vpn.com/' })?.revokedAt).toBeNull();
    expect(giftView({ row: { ...row, expiresAt: revokedAt }, link: 'https://gnome-vpn.com/' })?.revokedAt).toBe(revokedAt.toISOString());
  });

  it('skips a row that is not a whole gift', () => {
    expect(giftView({ row: { ...row, plan: null }, link: 'https://gnome-vpn.com/' })).toBeNull();
  });
});
