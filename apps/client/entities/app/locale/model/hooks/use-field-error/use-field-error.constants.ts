import { WIREGUARD_CONFIG_NAME } from '@gnomevpn/schemas';

export const VALIDATION_LIMITS = {
  wireguardNameMax: WIREGUARD_CONFIG_NAME.maxLength
} as const;
