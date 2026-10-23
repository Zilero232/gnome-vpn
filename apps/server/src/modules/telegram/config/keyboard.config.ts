import type { ButtonKey, ButtonStyle, KeyboardRow } from '../lib/keyboard';

export const KEYBOARD_ROWS: KeyboardRow[] = [
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
];

export const MORE_ROWS: KeyboardRow[] = [
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
];

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
