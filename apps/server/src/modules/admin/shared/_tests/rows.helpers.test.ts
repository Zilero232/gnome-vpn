import { ADMIN_GIFT, adminGiftSchema, adminPaymentSchema, formatGiftCode, GIFT_CODE } from '@gnomevpn/schemas';
import { subMinutes } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { Prisma } from '@/generated';

import type { GiftRow, PaymentRow } from '../admin.types';

import { giftView, isAutoRenewOn, maskGiftCode, paymentView } from '../rows.helpers';

const NOW = new Date('2026-10-23T12:00:00.000Z');

const CODE = 'ABCDEFGHJKMN';

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

const gift = (patch: Partial<GiftRow> = {}): GiftRow => ({
  id: 'gift-1',
  code: CODE,
  plan: 'monthly',
  days: 30,
  createdAt: NOW,
  expiresAt: null,
  buyer: null,
  redemptions: [],
  ...patch
});

describe('maskGiftCode', () => {
  it('shows only the tail of the code', () => {
    const masked = maskGiftCode(CODE);

    expect(masked.endsWith(CODE.slice(-ADMIN_GIFT.visibleTail))).toBe(true);
    expect(masked).not.toContain(CODE.slice(0, CODE.length - ADMIN_GIFT.visibleTail));
  });

  it('keeps the grouping the buyer sees', () => {
    expect(maskGiftCode(CODE)).toHaveLength(formatGiftCode(CODE).length);
    expect(maskGiftCode(CODE).split(GIFT_CODE.separator)).toHaveLength(formatGiftCode(CODE).split(GIFT_CODE.separator).length);
  });

  it('masks every character it hides', () => {
    const hidden = maskGiftCode(CODE)
      .replaceAll(GIFT_CODE.separator, '')
      .slice(0, CODE.length - ADMIN_GIFT.visibleTail);

    expect([...hidden].every((char) => char === ADMIN_GIFT.mask)).toBe(true);
  });
});

describe('isAutoRenewOn', () => {
  it('needs a saved card and no cancellation', () => {
    expect(isAutoRenewOn({ savedCardId: 'pm-1', cancelAtPeriodEnd: false })).toBe(true);
    expect(isAutoRenewOn({ savedCardId: 'pm-1', cancelAtPeriodEnd: true })).toBe(false);
    expect(isAutoRenewOn({ savedCardId: null, cancelAtPeriodEnd: false })).toBe(false);
  });
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
