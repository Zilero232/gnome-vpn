import { z } from 'zod';

import { CONSENT_INPUT, CONSENT_KINDS, CONSENT_SOURCES, UNSUBSCRIBE_OUTCOMES } from './consents.constants';

export const consentKindSchema = z.enum(CONSENT_KINDS);

export const consentSourceSchema = z.enum(CONSENT_SOURCES);

export const personalDataConsentSchema = z.object({
  granted: z.boolean(),
  version: z.string(),
  at: z.string()
});

export const marketingConsentSchema = z.object({
  granted: z.boolean(),
  at: z.string()
});

export const consentStateSchema = z.object({
  personalData: personalDataConsentSchema.nullable(),
  marketing: marketingConsentSchema.nullable()
});

export const updateMarketingConsentSchema = z.object({
  granted: z.boolean(),
  source: z.enum(CONSENT_INPUT.marketingSources)
});

export const recordPersonalDataConsentSchema = z.object({
  version: z.string().regex(CONSENT_INPUT.versionPattern),
  source: z.enum(CONSENT_INPUT.personalDataSources)
});

export const unsubscribeQuerySchema = z.object({
  token: z.string().trim().max(CONSENT_INPUT.tokenMaxLength).default('')
});

export const unsubscribeResultSchema = z.object({
  outcome: z.enum(UNSUBSCRIBE_OUTCOMES)
});
