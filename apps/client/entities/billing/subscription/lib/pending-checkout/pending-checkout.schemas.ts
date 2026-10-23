import { z } from 'zod';

export const pendingCheckoutSchema = z.object({
  startedAt: z.number(),
  fingerprint: z.string()
});
