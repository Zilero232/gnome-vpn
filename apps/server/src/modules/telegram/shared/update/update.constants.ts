export const MEMBER_STATUS = {
  botBlocked: 'kicked',
  botUnblocked: 'member',
  inGroup: ['member', 'administrator'],
  outOfGroup: ['left', 'kicked']
} as const;

export const DELIVERY = {
  blockedCode: 403,
  floodCode: 429,
  sourceMissing: /message to copy not found|message_id_invalid|can't be copied|protected content/iu
} as const;

export const BOT_URL_BASE = 'https://t.me/';
