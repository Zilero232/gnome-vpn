import type { AdminGift, AdminPayment } from '@gnomevpn/schemas';

import { ADMIN_GIFT, formatGiftCode } from '@gnomevpn/schemas';
import { isAfter } from 'date-fns';
import { isNonNullish } from 'remeda';

import type { AutoRenewFlags, GiftViewInput, PaymentRow } from './admin.types';

import { isoOrNull } from './listing.helpers';

export const maskGiftCode = (code: string): string => {
  const visible = Math.min(ADMIN_GIFT.visibleTail, code.length);

  return formatGiftCode(`${ADMIN_GIFT.mask.repeat(code.length - visible)}${code.slice(code.length - visible)}`);
};

export const isAutoRenewOn = ({ savedCardId, cancelAtPeriodEnd }: AutoRenewFlags): boolean => isNonNullish(savedCardId) && !cancelAtPeriodEnd;

export const paymentView = (row: PaymentRow): AdminPayment => ({
  id: row.id,
  yookassaPaymentId: row.yookassaPaymentId,
  user: row.user,
  amount: row.amount.toNumber(),
  status: row.status,
  kind: row.kind,
  plan: row.plan,
  isAutoCharge: row.isAutoCharge,
  extraDevices: row.extraDevices,
  discountPercent: row.discountPercent,
  promoCode: row.promoCode?.code ?? null,
  createdAt: row.createdAt.toISOString(),
  refundRequestedAt: isoOrNull(row.refundRequestedAt)
});

export const giftView = ({ row, now }: GiftViewInput): AdminGift => {
  const redemption = row.redemptions.at(0);

  return {
    id: row.id,
    code: maskGiftCode(row.code),
    plan: row.plan,
    days: row.days,
    buyer: row.buyer,
    createdAt: row.createdAt.toISOString(),
    redeemedAt: isoOrNull(redemption?.createdAt),
    redeemedBy: redemption?.user ?? null,
    isRevoked: isNonNullish(row.expiresAt) && !isAfter(row.expiresAt, now)
  };
};
