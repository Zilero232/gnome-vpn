import { z } from 'zod';

import { flag } from './env.helpers';

export const emailEnv = z
  .object({
    SMTP_HOST: z.string().default(''),
    SMTP_PORT: z.coerce.number().default(465),
    SMTP_SECURE: flag('true'),
    SMTP_USER: z.string().default(''),
    SMTP_PASSWORD: z.string().default(''),
    EMAIL_FROM: z.string().default(''),
    DEV_EMAIL_OVERRIDE: z.email().optional()
  })
  .transform((raw) => ({
    from: raw.EMAIL_FROM,
    devOverride: raw.DEV_EMAIL_OVERRIDE,
    smtp: {
      host: raw.SMTP_HOST,
      port: raw.SMTP_PORT,
      secure: raw.SMTP_SECURE,
      user: raw.SMTP_USER,
      password: raw.SMTP_PASSWORD
    }
  }));
