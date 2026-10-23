import type { z } from 'zod';

import type {
  consentKindSchema,
  consentSourceSchema,
  consentStateSchema,
  recordPersonalDataConsentSchema,
  unsubscribeQuerySchema,
  unsubscribeResultSchema,
  updateMarketingConsentSchema
} from './consents.schemas';

export type ConsentKind = z.infer<typeof consentKindSchema>;

export type ConsentSource = z.infer<typeof consentSourceSchema>;

export type ConsentState = z.infer<typeof consentStateSchema>;

export type UpdateMarketingConsentInput = z.infer<typeof updateMarketingConsentSchema>;

export type RecordPersonalDataConsentInput = z.infer<typeof recordPersonalDataConsentSchema>;

export type UnsubscribeQuery = z.input<typeof unsubscribeQuerySchema>;

export type UnsubscribeResult = z.infer<typeof unsubscribeResultSchema>;

export type UnsubscribeOutcome = UnsubscribeResult['outcome'];
