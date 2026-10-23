import { signUpSchema } from '@gnomevpn/schemas';
import { z } from 'zod';

export const signUpFormSchema = signUpSchema.extend({
  isConsentGiven: z.boolean().refine((isGiven) => isGiven, 'validation.consentRequired'),
  isMarketingConsentGiven: z.boolean()
});
