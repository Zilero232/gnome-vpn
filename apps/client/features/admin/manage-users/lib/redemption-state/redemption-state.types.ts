import type { AdminRedemption } from '@gnomevpn/schemas';

export type RedemptionState = 'applied' | 'consumed' | 'pending' | 'replaced';

export type RedemptionStateInput = Pick<AdminRedemption, 'consumedAt' | 'kind' | 'replacedAt'>;
