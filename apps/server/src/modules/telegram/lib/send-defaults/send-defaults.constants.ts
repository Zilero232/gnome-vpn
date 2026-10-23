export const SEND_DEFAULTS = {
  formattedMethods: ['sendMessage', 'editMessageText'],
  badRequest: 400,
  unknownEffect: /EFFECT_ID_INVALID/i,
  brokenMarkup: /can't parse entities/i,
  widthLine: '\u2800'.repeat(32)
} as const;
