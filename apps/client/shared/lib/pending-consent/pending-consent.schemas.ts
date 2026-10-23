import { z } from 'zod';

export const pendingConsentSchema = z.object({
  userId: z.string().min(1),
  version: z.string().min(1)
});
