export const BROADCAST = {
  perSecond: 25,
  floodRetries: 3,
  blockedCode: 403,
  floodCode: 429,
  sourceMissing: /message to copy not found|message_id_invalid|can't be copied|protected content/iu,
  copyableFields: [
    'text',
    'caption',
    'photo',
    'video',
    'animation',
    'document',
    'audio',
    'voice',
    'video_note',
    'sticker',
    'poll',
    'location',
    'contact',
    'venue',
    'dice'
  ] as const
} as const;

export const BROADCAST_AUDIENCES = ['all', 'active', 'inactive'] as const;
