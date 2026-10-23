import { PROMO_CODE, WIREGUARD_CONFIG_NAME } from '@gnomevpn/schemas';

export const VALIDATION_LIMITS = {
  wireguardNameMax: WIREGUARD_CONFIG_NAME.maxLength,
  promoCodeMin: PROMO_CODE.minLength,
  promoCodeMax: PROMO_CODE.maxLength
} as const;
