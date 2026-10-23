import type { PaymentMethod } from '@gnomevpn/schemas';

import { milliseconds } from 'date-fns';

export const YOOKASSA_METHODS: Record<string, PaymentMethod> = {
  bank_card: 'card',
  sbp: 'sbp',
  sberbank: 'sberPay',
  tinkoff_bank: 'tPay',
  yoo_money: 'yooMoney'
};

export const PAYMENT_METHODS_CACHE = {
  key: 'billing:payment-methods',
  ttlMs: milliseconds({ hours: 1 }),
  fallbackTtlMs: milliseconds({ minutes: 5 }),
  fallback: ['card'] satisfies readonly PaymentMethod[]
} as const;
