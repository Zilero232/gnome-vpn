import { z } from 'zod';

import { nodeStatusSchema } from '../../status/status.schemas';

export const adminNodeSchema = nodeStatusSchema.extend({
  id: z.string(),
  country: z.string(),
  city: z.string().nullable(),
  host: z.string(),
  port: z.number().int().positive(),
  isAvailable: z.boolean(),
  isOverloaded: z.boolean(),
  displayOrder: z.number().int(),
  lastHealthyAt: z.string().nullable(),
  createdAt: z.string()
});

export const adminNodeListSchema = z.object({
  nodes: z.array(adminNodeSchema)
});

export const adminNodeAvailabilitySchema = z.object({
  isAvailable: z.boolean()
});
