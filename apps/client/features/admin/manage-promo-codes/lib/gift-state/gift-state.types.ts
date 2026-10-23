import type { AdminGift } from '@gnomevpn/schemas';

export type GiftState = 'redeemed' | 'revoked' | 'waiting';

export type GiftStateInput = Pick<AdminGift, 'isRevoked' | 'redeemedAt'>;
