import type { CheckoutLocale } from '@gnomevpn/schemas';

export type LocalizedReturnUrlInput = {
  baseUrl: string;
  locale: CheckoutLocale | undefined;
};
