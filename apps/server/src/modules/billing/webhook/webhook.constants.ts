import type { Prisma } from '@/generated';

import { env } from '@/config';

import type { RefundReason } from './refund.types';

const YOOKASSA_CIDRS = [
  '185.71.76.0/27',
  '185.71.77.0/27',
  '77.75.153.0/25',
  '77.75.156.11/32',
  '77.75.156.35/32',
  '77.75.154.128/25',
  '2a02:5180::/32'
] as const;

const LOOPBACK_CIDRS = ['127.0.0.1/32', '::1/128'] as const;

export const WEBHOOK_ALLOWED_CIDRS: readonly string[] = env.app.isProduction ? YOOKASSA_CIDRS : [...YOOKASSA_CIDRS, ...LOOPBACK_CIDRS];

export const WEBHOOK_EVENT = {
  methodActive: 'payment_method.active',
  paymentPrefix: 'payment.',
  refundSucceeded: 'refund.succeeded'
} as const;

export const CARD_LOST_REASONS = ['card_expired', 'invalid_card_number', 'permission_revoked'] as const;

export const REFUND = {
  idempotencePrefix: 'refund-',
  description: {
    lapsed: 'Возврат: подписка GnomeVPN закончилась до оплаты устройств',
    orphan: 'Возврат: аккаунт GnomeVPN удалён до оплаты',
    discountUsed: 'Возврат: скидка по промокоду GnomeVPN уже использована другим платежом'
  } satisfies Record<RefundReason, string>
} as const;

export const ACTIVATION_SELECT = {
  currentPeriodEnd: true,
  cancelAtPeriodEnd: true,
  savedCardId: true,
  trialStartedAt: true,
  bonusDays: true
} as const satisfies Prisma.SubscriptionSelect;
