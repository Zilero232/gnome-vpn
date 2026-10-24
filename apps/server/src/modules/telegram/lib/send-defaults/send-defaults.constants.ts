export const SEND_DEFAULTS = {
  formattedMethods: ['sendMessage', 'editMessageText'],
  badRequest: 400,
  unknownEffect: /EFFECT_ID_INVALID/i,
  brokenMarkup: /can't parse entities/i,
  width: {
    cells: 32,
    fill: '\u2800',
    emojiCells: 2,
    emoji: /\p{Extended_Pictographic}/u,
    trailingSpace: /\s+$/u,
    closingBlocks: /(?:<\/(?:blockquote|pre|code)>\s*)+$/u,
    filled: /\u2800(?:<\/(?:blockquote|pre|code)>\s*)*$/u
  }
} as const;
