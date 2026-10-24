import { z } from 'zod';

export const databaseEnv = z
  .object({
    DATABASE_URL: z.url(),
    DIRECT_URL: z.url()
  })
  .transform((raw) => ({
    url: raw.DATABASE_URL,
    directUrl: raw.DIRECT_URL
  }));
