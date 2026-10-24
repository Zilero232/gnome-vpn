import { isNullish, sortBy, uniqueBy } from 'remeda';
import { match } from 'ts-pattern';

import type { PaymentKind } from '@/generated';
import type { NoticeKey } from '@/modules/telegram/notify';

import { CHECKOUT_REMINDER } from '@/modules/scheduler/config';

import type { AbandonedCheckout, CheckoutRow } from './abandoned-checkout.types';

export const checkoutNotice = (kind: PaymentKind): NoticeKey | null =>
  match(kind)
    .returnType<NoticeKey | null>()
    .with('subscription', () => CHECKOUT_REMINDER.notice.subscription)
    .with('gift', () => CHECKOUT_REMINDER.notice.gift)
    .with('extraDevices', () => null)
    .exhaustive();

export const abandonedCheckouts = (rows: CheckoutRow[]): AbandonedCheckout[] => {
  const newest = uniqueBy(sortBy(rows, [(row) => row.createdAt.getTime(), 'desc']), (row) => row.userId);

  return newest.flatMap(({ id, userId, kind, createdAt }) => {
    const notice = checkoutNotice(kind);

    return isNullish(userId) || isNullish(notice) ? [] : [{ id, userId, createdAt, notice }];
  });
};
