import { describe, expect, it } from 'vitest';

import { describeCard, toAmount } from '../yookassa.helpers';
import { paymentResponseSchema, refundResponseSchema } from '../yookassa.schemas';

describe('describeCard', () => {
  it('joins the card type with the masked last four digits', () => {
    expect(describeCard({ card: { card_type: 'MasterCard', last4: '4444' } })).toBe('MasterCard •••• 4444');
  });

  it('renders only the masked digits when the card has no type', () => {
    expect(describeCard({ card: { last4: '4444' } })).toBe('•••• 4444');
  });

  it('falls back to the title when there is no card', () => {
    expect(describeCard({ title: 'Основная карта' })).toBe('Основная карта');
  });

  it('returns null when there is neither a card nor a title', () => {
    expect(describeCard({})).toBeNull();
    expect(describeCard({ card: null, title: null })).toBeNull();
  });

  it('falls back to the title when the card carries no last four digits', () => {
    expect(describeCard({ card: { card_type: 'MasterCard' }, title: 'Основная карта' })).toBe('Основная карта');
  });

  it('returns null when the card carries no last four digits and there is no title', () => {
    expect(describeCard({ card: { card_type: 'MasterCard' } })).toBeNull();
  });

  it('prefers the card over the title', () => {
    expect(describeCard({ card: { card_type: 'Visa', last4: '1111' }, title: 'Основная карта' })).toBe('Visa •••• 1111');
  });
});

describe('toAmount', () => {
  it('sends roubles with two decimals, as YooKassa expects them', () => {
    expect(toAmount(199)).toEqual({ value: '199.00', currency: 'RUB' });
    expect(toAmount(1490.5)).toEqual({ value: '1490.50', currency: 'RUB' });
  });
});

describe('the response schemas', () => {
  it('read a payment and drop the fields we never use', () => {
    const payment = paymentResponseSchema.parse({
      id: '2d9b1c2e-000f-5000-9000-1b2c3d4e5f60',
      status: 'succeeded',
      paid: true,
      test: false,
      amount: { value: '199.00', currency: 'RUB' },
      payment_method: { type: 'bank_card', id: 'pm-1', saved: true, card: { last4: '4444', card_type: 'MasterCard', expiry_year: '2030' } },
      metadata: {}
    });

    expect(payment.status).toBe('succeeded');
    expect(payment.payment_method?.card?.last4).toBe('4444');
    expect(payment).not.toHaveProperty('paid');
  });

  it('take a field sent as null the same as one left out', () => {
    expect(paymentResponseSchema.parse({ id: 'p', status: 'pending', confirmation: null, cancellation_details: null }).confirmation).toBeNull();
  });

  it('refuse a status YooKassa does not document, rather than guess what it means', () => {
    expect(() => paymentResponseSchema.parse({ id: 'p', status: 'settled' })).toThrow();
    expect(() => refundResponseSchema.parse({ id: 'r', payment_id: 'p', status: 'done', amount: { value: '1.00', currency: 'RUB' } })).toThrow();
  });
});
