import type { OwnerRoutes, ReaderRoutes } from './bot.types';

export const WEBHOOK = {
  path: 'telegram/webhook',
  secretHeader: 'x-telegram-bot-api-secret-token'
} as const;

export const READER_ROUTES = {
  actions: [
    { command: 'connect', button: 'connect', route: 'sendLink' },
    { command: 'link', route: 'sendLink' },
    { command: 'status', button: 'status', route: 'status' },
    { command: 'buy', button: 'buy', route: 'buy' },
    { button: 'renew', route: 'buy' },
    { command: 'trial', button: 'trial', route: 'trial' },
    { command: 'apps', button: 'apps', route: 'apps' },
    { command: 'devices', button: 'devices', route: 'devices' },
    { command: 'wireguard', button: 'wireguard', route: 'wireguard' },
    { button: 'more', route: 'more' },
    { command: 'invite', button: 'invite', route: 'invite' },
    { command: 'rotate', button: 'rotate', route: 'rotate' },
    { button: 'autoRenew', route: 'autoRenew' },
    { command: 'website', button: 'website', route: 'website' },
    { command: 'language', button: 'language', route: 'language' },
    { command: 'offers', route: 'offers' },
    { command: 'help', button: 'help', route: 'help' },
    { command: 'support', button: 'support', route: 'support' },
    { command: 'unlink', button: 'unlink', route: 'unlink' },
    { command: 'delete', button: 'deleteAccount', route: 'deleteAccount' }
  ],
  callbacks: [
    'menu',
    'plan',
    'locale',
    'client',
    'unlink',
    'deleteAccount',
    'rotate',
    'autoRenew',
    'offers',
    'devices',
    'forgetDevice',
    'removeDevice',
    'wireguard',
    'wireguardNode',
    'wireguardCreate',
    'wireguardFile'
  ],
  supportMedia: [
    'message:photo',
    'message:document',
    'message:voice',
    'message:audio',
    'message:video',
    'message:video_note',
    'message:animation',
    'message:sticker'
  ],
  commandPrefix: '/'
} as const satisfies ReaderRoutes;

export const OWNER_ROUTES = {
  commands: ['stats', 'broadcast', 'promo'],
  callbacks: ['broadcastAudience', 'broadcastSend']
} as const satisfies OwnerRoutes;

export const ANY_CHAT_ROUTES = {
  chatIdCommand: 'chatid',
  groupChats: ['group', 'supergroup']
} as const;
