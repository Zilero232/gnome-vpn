import type { AdminCampaign, AdminGift, AdminNode, AdminPayment, AdminUser, CampaignKind } from '@gnomevpn/schemas';

import { CAMPAIGN_KINDS, isPlaceholderEmail } from '@gnomevpn/schemas';
import { isAfter } from 'date-fns';
import { isIncludedIn, isNonNullish } from 'remeda';

import type { CampaignViewInput, GiftViewInput, NodeViewInput, PaymentRow, UserRow } from './row-views.types';

import { nodeStatus } from '../../../status';
import { periodKind } from '../../../subscription';
import { campaignState } from '../campaign-state';
import { maskGiftCode } from '../gift-mask';

const iso = (date: Date | null | undefined): string | null => date?.toISOString() ?? null;

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
  refundRequestedAt: iso(row.refundRequestedAt)
});

export const userView = (row: UserRow): AdminUser => ({
  id: row.id,
  email: row.email,
  hasEmail: !isPlaceholderEmail(row.email),
  emailVerified: row.emailVerified,
  createdAt: row.createdAt.toISOString(),
  access: periodKind(row.subscription),
  currentPeriodEnd: iso(row.subscription?.currentPeriodEnd),
  plan: row.subscription?.plan ?? null,
  devices: row._count.devices,
  telegram: row.telegramAccount ? { id: row.telegramAccount.telegramId.toString(), username: row.telegramAccount.username } : null
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
    redeemedAt: iso(redemption?.createdAt),
    redeemedBy: redemption?.user ?? null,
    isRevoked: isNonNullish(row.expiresAt) && !isAfter(row.expiresAt, now)
  };
};

const isCampaignKind = (kind: string): kind is CampaignKind => isIncludedIn(kind, CAMPAIGN_KINDS);

export const campaignView = ({ row, sales, now }: CampaignViewInput): AdminCampaign | null => {
  const { kind } = row;

  if (!isCampaignKind(kind)) {
    return null;
  }

  return {
    id: row.id,
    code: row.code,
    kind,
    percent: row.percent,
    days: row.days,
    maxUses: row.maxUses,
    expiresAt: iso(row.expiresAt),
    createdAt: row.createdAt.toISOString(),
    state: campaignState({ expiresAt: row.expiresAt, maxUses: row.maxUses, used: row._count.redemptions, now }),
    used: row._count.redemptions,
    payments: sales?.payments ?? 0,
    revenue: sales?.revenue ?? 0
  };
};

export const nodeView = ({ node, now }: NodeViewInput): AdminNode => ({
  ...nodeStatus({ node, now }),
  id: node.id,
  country: node.country,
  city: node.city,
  host: node.host,
  port: node.port,
  isAvailable: node.isAvailable,
  isOverloaded: node.isOverloaded,
  displayOrder: node.displayOrder,
  lastHealthyAt: iso(node.lastHealthyAt),
  createdAt: node.createdAt.toISOString()
});
