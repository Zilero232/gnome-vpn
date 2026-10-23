import type { AdminGift } from '@gnomevpn/schemas';

export type GiftStateInput = Pick<AdminGift, 'isRevoked' | 'redeemedAt'>;
