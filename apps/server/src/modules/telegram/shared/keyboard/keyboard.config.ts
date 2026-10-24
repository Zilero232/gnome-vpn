import type { ButtonKey } from '@/modules/telegram/telegram.types';

import type { ButtonStyle, KeyboardRow } from './keyboard.types';

export const KEYBOARD_ROWS: Record<'main' | 'more', KeyboardRow[]> = {
  main: [
    [
      { key: 'connect', when: 'subscribed' },
      { key: 'apps', when: 'subscribed' }
    ],
    [
      { key: 'status', when: 'subscribed' },
      { key: 'renew', when: 'subscribed' }
    ],
    [
      { key: 'trial', when: 'trialAvailable' },
      { key: 'buy', when: 'unsubscribed' }
    ],
    [
      { key: 'devices', when: 'subscribed' },
      { key: 'more', when: 'always' }
    ]
  ],
  more: [
    [
      { key: 'support', when: 'always' },
      { key: 'help', when: 'always' }
    ],
    [
      { key: 'invite', when: 'always' },
      { key: 'website', when: 'always' }
    ],
    [
      { key: 'autoRenew', when: 'subscribed' },
      { key: 'rotate', when: 'subscribed' }
    ],
    [
      { key: 'language', when: 'always' },
      { key: 'unlink', when: 'always' }
    ],
    [{ key: 'deleteAccount', when: 'always' }]
  ]
};

export const BUTTON_STYLE: Partial<Record<ButtonKey, ButtonStyle>> = {
  connect: 'primary',
  renew: 'success',
  buy: 'success',
  trial: 'success',
  deleteAccount: 'danger'
};

export const LEGACY_BUTTONS: Readonly<Record<string, ButtonKey>> = {
  '➕ Устройства': 'devices',
  '➕ Devices': 'devices',
  '🔄 Автосписание': 'autoRenew',
  '🔄 Auto-charge': 'autoRenew',
  '🔁 Обновить ссылку': 'rotate',
  '🗑️ Удалить аккаунт': 'deleteAccount',
  '🗑️ Delete account': 'deleteAccount'
};

export const LANGUAGE_MENU = {
  buttons: [
    { locale: 'ru', label: 'Русский' },
    { locale: 'en', label: 'English' }
  ],
  currentMark: '✓'
} as const;

export const BUTTON_URL = {
  protocol: 'https:',
  localHosts: ['localhost', '127.0.0.1', '[::1]', '0.0.0.0']
} as const;
