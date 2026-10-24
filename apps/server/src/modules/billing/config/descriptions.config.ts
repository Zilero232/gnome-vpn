import type { PluralForms } from '@/common/lib';

export const MONTH_FORMS: PluralForms = {
  one: 'месяц',
  few: 'месяца',
  many: 'месяцев'
};

export const DEVICE_FORMS: PluralForms = {
  one: 'устройство',
  few: 'устройства',
  many: 'устройств'
};

export const SUBSCRIPTION_PREFIX = {
  purchase: 'Подписка GnomeVPN на',
  renewal: 'Продление подписки GnomeVPN на',
  gift: 'Подарочная подписка GnomeVPN на'
} as const;

export const EXTRA_DEVICES_PREFIX = 'Дополнительные устройства GnomeVPN:';

export const REFUND_DESCRIPTION = {
  lapsed: 'Возврат: подписка GnomeVPN закончилась до оплаты устройств',
  orphan: 'Возврат: аккаунт GnomeVPN удалён до оплаты',
  discountUsed: 'Возврат: скидка по промокоду GnomeVPN уже использована другим платежом'
} as const;
