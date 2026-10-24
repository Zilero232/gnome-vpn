export const CALLBACK_PREFIX = {
  menu: 'menu:',
  plan: 'plan:',
  locale: 'locale:',
  client: 'client:',
  unlink: 'unlink:',
  rotate: 'rotate:',
  autoRenew: 'renew:',
  devices: 'devices:',
  forgetDevice: 'forget:',
  removeDevice: 'remove:',
  wireguard: 'wg:',
  wireguardNode: 'wgnode:',
  wireguardCreate: 'wgnew:',
  wireguardFile: 'wgfile:',
  deleteAccount: 'delete:',
  offers: 'offers:',
  broadcastAudience: 'bcast:',
  broadcastSend: 'bsend:'
} as const;

export const CALLBACK_VALUE = {
  separator: ':',
  answer: { yes: 'yes', no: 'no' },
  switch: { on: 'on', off: 'off' },
  clientList: 'list',
  wireguardKinds: ['phone', 'computer', 'router'],
  audiences: ['all', 'active', 'inactive']
} as const;
