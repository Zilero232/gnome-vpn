import { z } from 'zod';

export const telegramEnv = z
  .object({
    TELEGRAM_BOT_TOKEN: z.string().default(''),
    TELEGRAM_BOT_USERNAME: z.string().default(''),
    TELEGRAM_WEBHOOK_SECRET: z.string().default(''),
    TELEGRAM_WEBHOOK_URL: z.union([z.literal(''), z.url({ protocol: /^https$/u })]).default(''),
    TELEGRAM_ADMIN_CHAT_ID: z.union([z.literal(''), z.string().regex(/^-?\d+$/u)]).default('')
  })
  .transform((raw) => ({
    botToken: raw.TELEGRAM_BOT_TOKEN,
    botUsername: raw.TELEGRAM_BOT_USERNAME,
    webhookSecret: raw.TELEGRAM_WEBHOOK_SECRET,
    webhookUrl: raw.TELEGRAM_WEBHOOK_URL,
    adminChatId: raw.TELEGRAM_ADMIN_CHAT_ID
  }));
