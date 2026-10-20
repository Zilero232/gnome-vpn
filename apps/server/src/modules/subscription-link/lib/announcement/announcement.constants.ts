import type { PluralForms } from '../../../../common/lib';

export const ANNOUNCE = {
  expiryWarningDays: 3,
  nodeStaleMinutes: 10,
  freshNodeDays: 7,
  locale: 'ru-RU',
  dayForms: {
    one: 'день',
    few: 'дня',
    many: 'дней',
    other: 'дня'
  } satisfies PluralForms
} as const;

export const ANNOUNCEMENTS = {
  noSubscription: 'Подписка не оформлена — серверы недоступны. Оформите её в личном кабинете.',
  expired: 'Подписка истекла — серверы недоступны. Продлите её в личном кабинете.',
  deviceLimit: (limit: number) =>
    `Достигнут лимит устройств (${limit}) — на этом устройстве серверы недоступны. Отвяжите лишнее в личном кабинете или командой /devices в боте.`,
  hwidRequired:
    'INCY не передаёт идентификатор устройства (HWID) — серверы на этом устройстве недоступны. Включите отправку HWID в настройках подписки INCY и обновите подписку.',
  hwidNudge:
    'Включите отправку HWID в настройках подписки INCY: без неё все ваши копии INCY делят одно место. Если мест не хватит, удалите старое устройство INCY в личном кабинете.',
  preparing: 'Серверы для этого устройства ещё готовятся — обновите подписку в приложении через минуту.',
  expiringToday: 'Подписка заканчивается сегодня. Продлите её, чтобы не потерять доступ.',
  expiringInDays: (left: string) => `Подписка заканчивается через ${left}. Продлите её, чтобы не потерять доступ.`,
  nodesDown: (countries: string) => `Временно недоступны: ${countries}. Выберите другой сервер в списке.`,
  freshNodes: (countries: string) => `Новые серверы: ${countries}.`
} as const;

export const HWID_HINT = {
  required: 'required',
  nudge: 'nudge'
} as const;
