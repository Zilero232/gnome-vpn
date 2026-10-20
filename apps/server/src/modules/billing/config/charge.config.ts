export const CARD_LOST_REASONS: readonly string[] = ['card_expired', 'invalid_card_number', 'permission_revoked'];

export const CHECKOUT_REUSE = {
  windowMinutes: 15
} as const;

export const REFUND = {
  idempotencePrefix: 'refund-'
} as const;
