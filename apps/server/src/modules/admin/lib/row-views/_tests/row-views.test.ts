import { adminGiftSchema, adminNodeSchema, adminPaymentSchema, adminUserSchema, telegramPlaceholderEmail } from '@gnomevpn/schemas';
import { addDays, subMinutes } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { Prisma } from '@/generated';

import type { GiftRow, PaymentRow, UserRow } from '../row-views.types';

import { giftView, nodeView, paymentView, userView } from '../row-views';

const NOW = new Date('2026-10-23T12:00:00.000Z');

const payment = (patch: Partial<PaymentRow> = {}): PaymentRow => ({
  id: 'payment-1',
  yookassaPaymentId: 'yk-1',
  amount: new Prisma.Decimal('990.00'),
  status: 'succeeded',
  kind: 'subscription',
  plan: 'halfYearly',
  isAutoCharge: false,
  extraDevices: 0,
  discountPercent: null,
  createdAt: NOW,
  refundRequestedAt: null,
  user: { id: 'user-1', email: 'reader@example.com' },
  promoCode: null,
  ...patch
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

const gift = (patch: Partial<GiftRow> = {}): GiftRow => ({
  id: 'gift-1',
  code: 'ABCDEFGHJKMN',
  plan: 'monthly',
  days: 30,
  createdAt: NOW,
  expiresAt: null,
  buyer: null,
  redemptions: [],
  ...patch
});

describe('paymentView', () => {
  it('turns the decimal amount into a number the contract accepts', () => {
    const view = paymentView(payment());

    expect(view.amount).toBe(990);
    expect(adminPaymentSchema.parse(view)).toEqual(view);
  });

  it('names the discount code rather than its row', () => {
    expect(paymentView(payment({ promoCode: { code: 'BLOGGER20' }, discountPercent: 20 })).promoCode).toBe('BLOGGER20');
  });
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

describe('giftView', () => {
  it('never hands out the full code', () => {
    const row = gift();
    const view = giftView({ row, now: NOW });

    expect(view.code.replaceAll('-', '')).not.toBe(row.code);
    expect(adminGiftSchema.parse(view)).toEqual(view);
  });

  it('marks a gift whose expiry has come as revoked', () => {
    expect(giftView({ row: gift({ expiresAt: subMinutes(NOW, 1) }), now: NOW }).isRevoked).toBe(true);
    expect(giftView({ row: gift(), now: NOW }).isRevoked).toBe(false);
  });

  it('names who redeemed it and when', () => {
    const redeemer = { id: 'user-2', email: 'friend@example.com' };
    const view = giftView({ row: gift({ redemptions: [{ createdAt: NOW, user: redeemer }] }), now: NOW });

    expect(view.redeemedBy).toEqual(redeemer);
    expect(view.redeemedAt).toBe(NOW.toISOString());
  });
});

describe('nodeView', () => {
  it('gives an admin the host but never the panel or the keys', () => {
    const secrets = { apiUrl: 'https://203.0.113.7:2053/secret-panel-path', apiTokenEnvVar: 'XRAY_KEY_DE' };

    const row = {
      id: 'node-1',
      country: 'Germany',
      countryCode: 'DE',
      city: 'Frankfurt',
      host: '203.0.113.7',
      port: 443,
      isAvailable: true,
      isOverloaded: false,
      displayOrder: 0,
      createdAt: NOW,
      realityPublicKey: 'reality-public-key',
      realityShortId: 'short-id',
      wgPublicKey: null,
      lastHealthyAt: NOW,
      lastCheckedAt: NOW,
      uptime: [],
      ...secrets
    };

    const view = adminNodeSchema.parse(nodeView({ node: row, now: NOW }));
    const json = JSON.stringify(view);

    expect(view.host).toBe(row.host);

    for (const secret of [...Object.values(secrets), row.realityPublicKey, row.realityShortId]) {
      expect(json).not.toContain(secret);
    }
  });
});
