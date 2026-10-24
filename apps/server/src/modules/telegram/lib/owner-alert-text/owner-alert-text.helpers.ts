import { isPlaceholderEmail } from '@gnomevpn/schemas';
import { isNonNullish, isTruthy } from 'remeda';
import { match } from 'ts-pattern';

import { paymentPlan } from '@/common/lib';
import { BOT_TEXT } from '@/modules/telegram/config';

import type { AccountLabelInput, PurchaseLabelInput } from './owner-alert-text.types';

import { fillLabel } from '../fill-text';
import { planLabel } from '../plan-label';
import { LABEL_SEPARATOR } from './owner-alert-text.constants';

export const accountLabel = ({ account, locale }: AccountLabelInput): string => {
  const { userId, email, username, telegramId } = account;
  const parts = [
    isNonNullish(email) && !isPlaceholderEmail(email) ? email : null,
    isNonNullish(username) ? `@${username}` : null,
    isNonNullish(telegramId) ? `tg ${telegramId}` : null
  ].filter(isTruthy);

  if (parts.length > 0) {
    return parts.join(LABEL_SEPARATOR);
  }

  return isNonNullish(userId) ? `id ${userId}` : BOT_TEXT[locale].alertNoUser;
};

export const purchaseLabel = ({ purchase, locale }: PurchaseLabelInput): string =>
  match(purchase.kind)
    .with('extraDevices', () => fillLabel({ text: BOT_TEXT[locale].alertDevicesItem, fill: { count: String(purchase.extraDevices) } }))
    .with('gift', () => fillLabel({ text: BOT_TEXT[locale].alertGiftItem, fill: { plan: planLabel({ planId: paymentPlan(purchase), locale }) } }))
    .with('subscription', () => planLabel({ planId: paymentPlan(purchase), locale }))
    .exhaustive();
