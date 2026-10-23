import type { z } from 'zod';

import type { adminNodeAvailabilitySchema, adminNodeListSchema, adminNodeSchema } from './nodes.schemas';

export type AdminNode = z.infer<typeof adminNodeSchema>;

export type AdminNodeList = z.infer<typeof adminNodeListSchema>;

export type AdminNodeAvailability = z.infer<typeof adminNodeAvailabilitySchema>;
