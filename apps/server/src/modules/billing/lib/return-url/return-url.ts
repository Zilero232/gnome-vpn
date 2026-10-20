import { DEFAULT_CHECKOUT_LOCALE } from '@gnomevpn/schemas';

import type { LocalizedReturnUrlInput } from './return-url.types';

export const localizedReturnUrl = ({ baseUrl, locale }: LocalizedReturnUrlInput): string => {
  if (!locale || locale === DEFAULT_CHECKOUT_LOCALE) {
    return baseUrl;
  }

  const url = new URL(baseUrl);
  const prefix = `/${locale}`;

  if (url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)) {
    return url.toString();
  }

  url.pathname = url.pathname === '/' ? prefix : `${prefix}${url.pathname}`;

  return url.toString();
};
