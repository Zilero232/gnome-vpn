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

export const CONFIRMED = 'yes';

export const DECLINED = 'no';

export const SUBJECT_SEPARATOR = ':';

export const CLIENT_LIST = 'list';
