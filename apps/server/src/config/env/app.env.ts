import { z } from 'zod';

export const appEnv = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(4000),
    API_URL: z.url(),
    CLIENT_URL: z.url().default('http://localhost:3000'),
    SUPPORT_URL: z.string().default(''),
    CORS_ORIGINS: z.string().default('http://localhost:3000')
  })
  .transform((raw) => ({
    nodeEnv: raw.NODE_ENV,
    isDevelopment: raw.NODE_ENV === 'development',
    isProduction: raw.NODE_ENV === 'production',
    port: raw.PORT,
    apiUrl: raw.API_URL,
    clientUrl: raw.CLIENT_URL,
    supportUrl: raw.SUPPORT_URL,
    corsOrigins: raw.CORS_ORIGINS
  }));
