import { z } from 'zod';

const apiUrl = process.env.NODE_ENV === 'production' ? z.url() : z.url().default('http://localhost:4000');

const optional = <T extends z.ZodType>(field: T) => z.preprocess((value) => (value === '' ? undefined : value), field.optional());

const schema = z.object({
  NEXT_PUBLIC_API_URL: apiUrl,
  NEXT_PUBLIC_APP_VERSION: z.string().min(1).default('0.0.0'),
  NEXT_PUBLIC_SELLER_NAME: optional(z.string().trim().min(1)),
  NEXT_PUBLIC_SELLER_STATUS: optional(z.enum(['entrepreneur', 'selfEmployed'])),
  NEXT_PUBLIC_SELLER_INN: optional(z.string().regex(/^\d{12}$/u)),
  NEXT_PUBLIC_SELLER_OGRNIP: optional(z.string().regex(/^\d{15}$/u)),
  NEXT_PUBLIC_SELLER_ADDRESS: optional(z.string().trim().min(1))
});

export const env = schema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  NEXT_PUBLIC_SELLER_NAME: process.env.NEXT_PUBLIC_SELLER_NAME,
  NEXT_PUBLIC_SELLER_STATUS: process.env.NEXT_PUBLIC_SELLER_STATUS,
  NEXT_PUBLIC_SELLER_INN: process.env.NEXT_PUBLIC_SELLER_INN,
  NEXT_PUBLIC_SELLER_OGRNIP: process.env.NEXT_PUBLIC_SELLER_OGRNIP,
  NEXT_PUBLIC_SELLER_ADDRESS: process.env.NEXT_PUBLIC_SELLER_ADDRESS
});
