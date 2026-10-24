import { z } from 'zod';

import { flag } from './env.helpers';

export const yookassaEnv = z
  .object({
    YOOKASSA_SHOP_ID: z.string().default(''),
    YOOKASSA_SECRET_KEY: z.string().default(''),
    YOOKASSA_RETURN_URL: z.url().default('http://localhost:3000/account'),
    YOOKASSA_RECURRING: flag('false')
  })
  .transform((raw) => ({
    shopId: raw.YOOKASSA_SHOP_ID,
    secretKey: raw.YOOKASSA_SECRET_KEY,
    returnUrl: raw.YOOKASSA_RETURN_URL,
    isRecurringEnabled: raw.YOOKASSA_RECURRING
  }));
