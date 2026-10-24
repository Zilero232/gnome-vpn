import type { AdminRedemption, AdminReferral, AdminUserCard } from '@gnomevpn/schemas';

import { isPlaceholderEmail } from '@gnomevpn/schemas';

import { periodKind } from '@/modules/subscription';

import type { CardUserRow, RedemptionRow, UserCardInput } from './users.types';

import { isoOrNull } from '../shared/listing.helpers';
import { giftView, isAutoRenewOn, maskGiftCode, paymentView } from '../shared/rows.helpers';

const subscriptionView = (subscription: CardUserRow['subscription']): AdminUserCard['subscription'] =>
  subscription && {
    access: periodKind(subscription),
    plan: subscription.plan,
    currentPeriodEnd: isoOrNull(subscription.currentPeriodEnd),
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    isAutoRenewOn: isAutoRenewOn(subscription),
    savedCardTitle: subscription.savedCardTitle,
    extraDevices: subscription.extraDevices,
    bonusDays: subscription.bonusDays,
    trialStartedAt: isoOrNull(subscription.trialStartedAt)
  };

const redemptionView = ({ promoCode, createdAt, consumedAt, replacedAt }: RedemptionRow): AdminRedemption => ({
  code: promoCode.kind === 'gift' ? maskGiftCode(promoCode.code) : promoCode.code,
  kind: promoCode.kind,
  percent: promoCode.percent,
  days: promoCode.days,
  createdAt: createdAt.toISOString(),
  consumedAt: isoOrNull(consumedAt),
  replacedAt: isoOrNull(replacedAt)
});

const referredByView = (referral: CardUserRow['referredBy']): AdminReferral | null =>
  referral?.referrer
    ? {
        user: referral.referrer,
        createdAt: referral.createdAt.toISOString(),
        rewardedAt: isoOrNull(referral.rewardedAt),
        days: referral.friendDays
      }
    : null;

export const userCard = ({ user, devices, payments, invited, invitedTotal, redemptions, gifts, now }: UserCardInput): AdminUserCard => ({
  profile: {
    id: user.id,
    email: user.email,
    hasEmail: !isPlaceholderEmail(user.email),
    name: user.name,
    emailVerified: user.emailVerified,
    locale: user.locale,
    createdAt: user.createdAt.toISOString(),
    telegram: user.telegramAccount && {
      id: user.telegramAccount.telegramId.toString(),
      username: user.telegramAccount.username,
      linkedAt: user.telegramAccount.linkedAt.toISOString(),
      lastSeenAt: isoOrNull(user.telegramAccount.lastSeenAt)
    }
  },
  subscription: subscriptionView(user.subscription),
  link: user.subscriptionLink && {
    createdAt: user.subscriptionLink.createdAt.toISOString(),
    lastSeenAt: isoOrNull(user.subscriptionLink.lastSeenAt),
    lastPlatform: user.subscriptionLink.lastPlatform
  },
  devices,
  payments: payments.map(paymentView),
  referral: {
    code: user.referralCode?.code ?? null,
    referredBy: referredByView(user.referredBy),
    invited: invited.flatMap(({ referred, createdAt, rewardedAt, referrerDays }) =>
      referred ? [{ user: referred, createdAt: createdAt.toISOString(), rewardedAt: isoOrNull(rewardedAt), days: referrerDays }] : []
    ),
    invitedTotal
  },
  redemptions: redemptions.map(redemptionView),
  gifts: gifts.map((row) => giftView({ row, now }))
});
