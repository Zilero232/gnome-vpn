import { env } from './client-env';

export const SELLER = {
  name: env.NEXT_PUBLIC_SELLER_NAME,
  status: env.NEXT_PUBLIC_SELLER_STATUS,
  inn: env.NEXT_PUBLIC_SELLER_INN,
  ogrnip: env.NEXT_PUBLIC_SELLER_OGRNIP,
  address: env.NEXT_PUBLIC_SELLER_ADDRESS
} as const;
