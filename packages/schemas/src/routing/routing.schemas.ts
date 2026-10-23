import { z } from 'zod';

export const routingSettingsSchema = z.object({
  ruDirect: z.boolean(),
  blockAds: z.boolean()
});

export const updateRoutingSettingsSchema = routingSettingsSchema.partial();
