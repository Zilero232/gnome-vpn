import type { PaymentMethod } from '@gnomevpn/schemas';

import { DEFAULT_CHECKOUT_LOCALE, PAYMENT_METHODS } from '@gnomevpn/schemas';

import type { LocalizedReturnUrlInput } from './checkout.types';

import { YOOKASSA_METHODS } from './checkout.constants';

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

export const offeredMethods = (yookassaMethods: string[]): PaymentMethod[] => {
  const offered = new Set(yookassaMethods.map((method) => YOOKASSA_METHODS[method]));

  return PAYMENT_METHODS.filter((method) => offered.has(method));
};
