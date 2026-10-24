import type { Plan } from '@gnomevpn/schemas';

import { findPlan, TRIAL_DAYS } from '@gnomevpn/schemas';
import { addDays, addHours, addMonths, subDays, subHours } from 'date-fns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PERIOD_GRACE } from '@/common/lib';

import type { ActivationRow } from '../settlement.types';

import { activationData, purchaseOf, savedMethodOf, settleCheck } from '../settlement.helpers';

const NOW = new Date('2026-03-10T12:00:00.000Z');
const PLAN: Plan = findPlan('halfYearly');
const CARD = { id: 'pm-new', title: 'Visa •••• 1111' };

const paidRow = (overrides: Partial<ActivationRow> = {}): ActivationRow => ({
  currentPeriodEnd: addDays(NOW, 20),
  cancelAtPeriodEnd: false,
  savedCardId: 'pm-old',
  trialStartedAt: null,
  bonusDays: 0,
  ...overrides
});

describe('purchaseOf', () => {
  it('reads extra places as a quantity and never asks for a plan', () => {
    expect(purchaseOf({ kind: 'extraDevices', plan: null, extraDevices: 3 })).toEqual({ kind: 'extraDevices', quantity: 3 });
  });

  it('reads a subscription and a gift as the plan they bought', () => {
    expect(purchaseOf({ kind: 'subscription', plan: 'yearly', extraDevices: 0 })).toEqual({ kind: 'subscription', planId: 'yearly' });
    expect(purchaseOf({ kind: 'gift', plan: 'monthly', extraDevices: 0 })).toEqual({ kind: 'gift', planId: 'monthly' });
  });

  it('refuses a subscription or gift row without a plan, so it fails instead of granting a month', () => {
    expect(() => purchaseOf({ kind: 'subscription', plan: null, extraDevices: 0 })).toThrow('subscription');
    expect(() => purchaseOf({ kind: 'gift', plan: null, extraDevices: 0 })).toThrow('gift');
  });
});

describe('settleCheck', () => {
  it('cancels a canceled payment whatever was refunded', () => {
    expect(settleCheck({ status: 'canceled', refundedRub: 0 })).toBe('canceled');
  });

  it('waits on a payment that has not succeeded yet', () => {
    expect(settleCheck({ status: 'pending', refundedRub: 0 })).toBe('waiting');
    expect(settleCheck({ status: 'waiting_for_capture', refundedRub: 0 })).toBe('waiting');
  });

  it('marks a succeeded payment refunded before it settled, so nothing is granted for it', () => {
    expect(settleCheck({ status: 'succeeded', refundedRub: 0.01 })).toBe('refunded');
    expect(settleCheck({ status: 'succeeded', refundedRub: 199 })).toBe('refunded');
  });

  it('grants a succeeded payment with nothing refunded', () => {
    expect(settleCheck({ status: 'succeeded', refundedRub: 0 })).toBe('grant');
  });
});

describe('savedMethodOf', () => {
  it('keeps the method only when YooKassa saved one', () => {
    expect(savedMethodOf({ paymentMethodId: 'pm-1', paymentMethodTitle: 'Visa •••• 1111' })).toEqual({ id: 'pm-1', title: 'Visa •••• 1111' });
    expect(savedMethodOf({ paymentMethodId: null, paymentMethodTitle: 'Visa •••• 1111' })).toBeNull();
  });
});

describe('activationData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts a first purchase now, saves the method and turns renewal on', () => {
    const data = activationData({ subscription: null, plan: PLAN, method: CARD, orderedAt: NOW, isRecurringEnabled: true });

    expect(data).toEqual({
      plan: PLAN.id,
      currentPeriodEnd: addMonths(NOW, PLAN.months),
      bonusDays: 0,
      extraDevices: 0,
      cancelAtPeriodEnd: false,
      savedCardId: CARD.id,
      savedCardTitle: CARD.title
    });
  });

  it('stacks the term on a running paid period and keeps its extras', () => {
    const subscription = paidRow();
    const data = activationData({ subscription, plan: PLAN, method: null, orderedAt: NOW, isRecurringEnabled: true });

    expect(data.currentPeriodEnd).toEqual(addMonths(addDays(NOW, 20), PLAN.months));
    expect(data).not.toHaveProperty('extraDevices');
  });

  it('adds the banked bonus days after the months and empties the bank', () => {
    const data = activationData({ subscription: paidRow({ bonusDays: 7 }), plan: PLAN, method: null, orderedAt: NOW, isRecurringEnabled: true });

    expect(data.currentPeriodEnd).toEqual(addDays(addMonths(addDays(NOW, 20), PLAN.months), 7));
    expect(data.bonusDays).toBe(0);
  });

  it('reads paying during a trial as consent and turns renewal on, though the trial row says off', () => {
    const trial = paidRow({
      trialStartedAt: subHours(NOW, 2),
      currentPeriodEnd: addDays(subHours(NOW, 2), TRIAL_DAYS),
      cancelAtPeriodEnd: true,
      savedCardId: null
    });

    expect(activationData({ subscription: trial, plan: PLAN, method: CARD, orderedAt: NOW, isRecurringEnabled: true }).cancelAtPeriodEnd).toBe(false);
  });

  it('keeps renewal off inside a paid period when the reader turned it off, while replacing the method', () => {
    const data = activationData({
      subscription: paidRow({ cancelAtPeriodEnd: true }),
      plan: PLAN,
      method: CARD,
      orderedAt: NOW,
      isRecurringEnabled: true
    });

    expect(data.cancelAtPeriodEnd).toBe(true);
    expect(data.savedCardId).toBe(CARD.id);
  });

  it('keeps renewal on inside a paid period with the card already on file when the payment saved nothing', () => {
    const data = activationData({ subscription: paidRow(), plan: PLAN, method: null, orderedAt: NOW, isRecurringEnabled: true });

    expect(data.cancelAtPeriodEnd).toBe(false);
    expect(data).not.toHaveProperty('savedCardId');
  });

  it('keeps renewal off when there is no method to charge', () => {
    expect(activationData({ subscription: null, plan: PLAN, method: null, orderedAt: NOW, isRecurringEnabled: true }).cancelAtPeriodEnd).toBe(true);
    expect(
      activationData({ subscription: paidRow({ savedCardId: null }), plan: PLAN, method: null, orderedAt: NOW, isRecurringEnabled: true })
        .cancelAtPeriodEnd
    ).toBe(true);
  });

  it('never turns renewal on while the shop cannot charge recurrently', () => {
    expect(activationData({ subscription: null, plan: PLAN, method: CARD, orderedAt: NOW, isRecurringEnabled: false }).cancelAtPeriodEnd).toBe(true);
    expect(activationData({ subscription: paidRow(), plan: PLAN, method: CARD, orderedAt: NOW, isRecurringEnabled: false }).cancelAtPeriodEnd).toBe(
      true
    );
  });

  it('decides the extras by the moment the payment was ordered, not the moment it settled', () => {
    const end = subHours(NOW, 1);
    const lapsedRow = paidRow({ currentPeriodEnd: end });

    expect(
      activationData({ subscription: lapsedRow, plan: PLAN, method: null, orderedAt: subHours(end, 1), isRecurringEnabled: true })
    ).not.toHaveProperty('extraDevices');
    expect(
      activationData({
        subscription: lapsedRow,
        plan: PLAN,
        method: null,
        orderedAt: addHours(end, PERIOD_GRACE.hours - 1),
        isRecurringEnabled: true
      })
    ).not.toHaveProperty('extraDevices');
    expect(
      activationData({ subscription: lapsedRow, plan: PLAN, method: null, orderedAt: addHours(end, PERIOD_GRACE.hours), isRecurringEnabled: true })
        .extraDevices
    ).toBe(0);
  });

  it('starts a long-lapsed period from now and resets its extras', () => {
    const data = activationData({
      subscription: paidRow({ currentPeriodEnd: subDays(NOW, 40) }),
      plan: PLAN,
      method: null,
      orderedAt: NOW,
      isRecurringEnabled: true
    });

    expect(data.currentPeriodEnd).toEqual(addMonths(NOW, PLAN.months));
    expect(data.extraDevices).toBe(0);
  });
});
