import { mapValues } from 'remeda';
import { z } from 'zod';

import { appEnv } from './app.env';
import { authEnv } from './auth.env';
import { databaseEnv } from './database.env';
import { emailEnv } from './email.env';
import { telegramEnv } from './telegram.env';
import { yookassaEnv } from './yookassa.env';

const ENV_GROUPS = {
  app: appEnv,
  database: databaseEnv,
  auth: authEnv,
  yookassa: yookassaEnv,
  email: emailEnv,
  telegram: telegramEnv
};

export const envSchema = z.preprocess((raw) => mapValues(ENV_GROUPS, () => raw), z.object(ENV_GROUPS));

export type Env = z.output<typeof envSchema>;

export const validateEnv = (raw: Record<string, unknown>): Env => {
  const parsed = envSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(parsed.error)}`);
  }

  return parsed.data;
};
