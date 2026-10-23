import type { UnsubscribeOutcome } from '@gnomevpn/schemas';

export type UnsubscribeState = 'failed' | 'pending' | UnsubscribeOutcome;
