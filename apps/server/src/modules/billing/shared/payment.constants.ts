import type { PluralForms } from '@/common/lib';
import type { Prisma } from '@/generated';

import type { RefundReason, SubscriptionCharge } from './payment.types';

export const PAYMENT_SETTLE_SELECT = {
  id: true,
  yookassaPaymentId: true,
  userId: true,
  status: true,
  kind: true,
  plan: true,
  extraDevices: true,
  isAutoCharge: true,
  amount: true,
  promoCodeId: true,
  createdAt: true
} as const satisfies Prisma.PaymentSelect;

export const ACTIVATION_SELECT = {
  currentPeriodEnd: true,
  cancelAtPeriodEnd: true,
  savedCardId: true,
  trialStartedAt: true,
  bonusDays: true
} as const satisfies Prisma.SubscriptionSelect;

export const CARD_LOST_REASONS = ['card_expired', 'invalid_card_number', 'permission_revoked'] as const;

export const REFUND = {
  idempotencePrefix: 'refund-',
  description: {
    lapsed: 'Возврат: подписка GnomeVPN закончилась до оплаты устройств',
    orphan: 'Возврат: аккаунт GnomeVPN удалён до оплаты',
    discountUsed: 'Возврат: скидка по промокоду GnomeVPN уже использована другим платежом'
  } satisfies Record<RefundReason, string>
} as const;

export const PAYMENT_DESCRIPTION = {
  subscription: {
    purchase: 'Подписка GnomeVPN на',
    renewal: 'Продление подписки GnomeVPN на',
    gift: 'Подарочная подписка GnomeVPN на'
  } satisfies Record<SubscriptionCharge, string>,
  extraDevices: 'Дополнительные устройства GnomeVPN:',
  monthForms: { one: 'месяц', few: 'месяца', many: 'месяцев' } satisfies PluralForms,
  deviceForms: { one: 'устройство', few: 'устройства', many: 'устройств' } satisfies PluralForms
} as const;
