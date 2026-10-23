import type { AdminRedemption, AdminUserCard } from '@gnomevpn/schemas';

import { isPlaceholderEmail } from '@gnomevpn/schemas';
import { isNonNullish } from 'remeda';

import type { CardUserRow, RedemptionRow, UserCardInput } from './user-card.types';

import { periodKind } from '../../../subscription';
import { maskGiftCode } from '../gift-mask';
import { giftView, isoOrNull, paymentView } from '../row-views';

const subscriptionView = (subscription: CardUserRow['subscription']): AdminUserCard['subscription'] =>
  subscription && {
    access: periodKind(subscription),
    plan: subscription.plan,
    currentPeriodEnd: isoOrNull(subscription.currentPeriodEnd),
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    isAutoRenewOn: isNonNullish(subscription.savedCardId) && !subscription.cancelAtPeriodEnd,
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
    referredBy: user.referredBy && {
      user: user.referredBy.referrer,
      createdAt: user.referredBy.createdAt.toISOString(),
      rewardedAt: isoOrNull(user.referredBy.rewardedAt),
      days: user.referredBy.friendDays
    },
    invited: invited.map((referral) => ({
      user: referral.referred,
      createdAt: referral.createdAt.toISOString(),
      rewardedAt: isoOrNull(referral.rewardedAt),
      days: referral.referrerDays
    })),
    invitedTotal
  },
  redemptions: redemptions.map(redemptionView),
  gifts: gifts.map((row) => giftView({ row, now }))
});
