import type { z } from 'zod';

import type { pendingConsentSchema } from './pending-consent.schemas';

export type PendingConsent = z.infer<typeof pendingConsentSchema>;
