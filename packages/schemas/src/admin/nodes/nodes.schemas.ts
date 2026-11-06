import { z } from 'zod';

import { nodeStatusSchema } from '../../status/status.schemas';

export const adminNodeOnlineSchema = z.object({
  clients: z.number().int().nonnegative(),
  users: z.number().int().nonnegative()
});

export const adminNodePeakSchema = z.object({
  date: z.string(),
  clients: z.number().int().nonnegative().nullable(),
  clientsAt: z.string().nullable(),
  users: z.number().int().nonnegative().nullable(),
  cpu: z.number().nullable(),
  memory: z.number().nullable()
});

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
  createdAt: z.string(),
  online: adminNodeOnlineSchema.nullable(),
  peaks: z.array(adminNodePeakSchema)
});

export const adminNodeListSchema = z.object({
  nodes: z.array(adminNodeSchema)
});

export const adminNodeAvailabilitySchema = z.object({
  isAvailable: z.boolean()
});
