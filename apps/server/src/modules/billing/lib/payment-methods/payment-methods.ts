import type { PaymentMethod } from '@gnomevpn/schemas';

import { PAYMENT_METHODS } from '@gnomevpn/schemas';

import { YOOKASSA_METHODS } from '../../config';

export const offeredMethods = (yookassaMethods: string[]): PaymentMethod[] => {
  const offered = new Set(yookassaMethods.map((method) => YOOKASSA_METHODS[method]));

  return PAYMENT_METHODS.filter((method) => offered.has(method));
};
