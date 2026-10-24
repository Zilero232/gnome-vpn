import { match, P } from 'ts-pattern';

import { extendPeriod, hasLapsedBeyondGrace, paymentPlan } from '@/common/lib';
import { periodKind } from '@/modules/subscription';

import type { PaymentMethodRef, Purchase } from './payment.types';
import type { ActivationData, ActivationInput, PurchaseRow, SavedMethodInput, SettleCheck, SettleCheckInput } from './settlement.types';

export const purchaseOf = (row: PurchaseRow): Purchase =>
  match(row)
    .returnType<Purchase>()
    .with({ kind: 'extraDevices' }, ({ extraDevices }) => ({ kind: 'extraDevices', quantity: extraDevices }))
    .with({ kind: 'gift' }, (gift) => ({ kind: 'gift', planId: paymentPlan(gift) }))
    .with({ kind: 'subscription' }, (subscription) => ({ kind: 'subscription', planId: paymentPlan(subscription) }))
    .exhaustive();

export const settleCheck = (payment: SettleCheckInput): SettleCheck =>
  match(payment)
    .returnType<SettleCheck>()
    .with({ status: 'canceled' }, () => 'canceled')
    .with({ status: 'succeeded', refundedRub: P.number.gt(0) }, () => 'refunded')
    .with({ status: 'succeeded' }, () => 'grant')
    .otherwise(() => 'waiting');

export const savedMethodOf = ({ paymentMethodId, paymentMethodTitle }: SavedMethodInput): PaymentMethodRef | null =>
  paymentMethodId ? { id: paymentMethodId, title: paymentMethodTitle } : null;

export const activationData = ({ subscription, plan, method, orderedAt, isRecurringEnabled }: ActivationInput): ActivationData => {
  const currentPeriodEnd = subscription?.currentPeriodEnd;
  const hasMethod = Boolean(method?.id ?? subscription?.savedCardId);
  const isConsentGiven = periodKind(subscription) !== 'paid' && Boolean(method?.id);
  const wasCancelled = !isConsentGiven && (subscription?.cancelAtPeriodEnd ?? false);

  return {
    plan: plan.id,
    currentPeriodEnd: extendPeriod({ currentPeriodEnd, months: plan.months, days: subscription?.bonusDays ?? 0 }),
    bonusDays: 0,
    ...(hasLapsedBeyondGrace({ currentPeriodEnd, at: orderedAt }) && { extraDevices: 0 }),
    cancelAtPeriodEnd: !isRecurringEnabled || !hasMethod || wasCancelled,
    ...(method?.id ? { savedCardId: method.id, savedCardTitle: method.title } : {})
  };
};
